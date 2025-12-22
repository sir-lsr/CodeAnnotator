"""
标注管理API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Annotation, File
from ..schemas.annotation import AnnotationCreate, AnnotationUpdate, AnnotationResponse
from ..schemas.llm import LLMGenerateRequest
from ..services.llm_service import get_llm_service
from ..services.code_parser import code_parser
import os
import json

router = APIRouter(prefix="/annotations", tags=["annotations"])


def _load_user_settings() -> dict:
    """加载用户设置"""
    settings_file = "user_settings.json"
    if os.path.exists(settings_file):
        try:
            with open(settings_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "llmProvider": "openai",
        "llmModel": "gpt-3.5-turbo"
    }


@router.post("/generate")
async def generate_annotations(
    request: LLMGenerateRequest,
    db: Session = Depends(get_db)
):
    """生成代码标注"""
    # 获取文件
    file = db.query(File).filter(File.id == request.file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    # 加载用户设置
    user_settings = _load_user_settings()
    provider = user_settings.get("llmProvider", "openai")
    model = user_settings.get("llmModel", "gpt-3.5-turbo")
    openai_api_key = user_settings.get("openaiApiKey", "")
    openai_base_url = user_settings.get("openaiBaseUrl", "")
    anthropic_api_key = user_settings.get("anthropicApiKey", "")
    
    # 创建 LLM 服务实例
    llm_service = get_llm_service(
        provider=provider, 
        model=model,
        openai_api_key=openai_api_key,
        openai_base_url=openai_base_url,
        anthropic_api_key=anthropic_api_key
    )
    
    generated_annotations = []
    
    # 生成行内标注
    if request.generate_line_annotations:
        line_result = llm_service.generate_line_annotations(file.content, file.language)
        
        if 'error' in line_result:
            raise HTTPException(status_code=500, detail=f"LLM调用失败: {line_result['error']}")
        
        if 'annotations' in line_result:
            for ann in line_result['annotations']:
                db_annotation = Annotation(
                    file_id=file.id,
                    type="line",
                    line_number=ann['line'],
                    content=ann['content'],
                    annotation_type=ann['type'],
                    color=_get_color_for_type(ann['type'])
                )
                db.add(db_annotation)
                generated_annotations.append(db_annotation)
    
    # 生成函数标注
    if request.generate_function_annotations:
        # 解析代码
        parse_result = code_parser.parse_code(file.content, file.language)
        
        if parse_result['success'] and parse_result['functions']:
            for func in parse_result['functions']:
                func_code = func.get('code', '')
                if func_code:
                    func_result = llm_service.generate_function_annotations(
                        func_code,
                        file.language,
                        func['name']
                    )
                    
                    if 'error' not in func_result:
                        # 构建函数标注内容
                        content = _build_function_annotation_content(func_result)
                        
                        db_annotation = Annotation(
                            file_id=file.id,
                            type="function",
                            line_number=func['line_start'],
                            line_end=func.get('line_end'),
                            function_name=func['name'],
                            content=content,
                            annotation_type="info",
                            color="#1890ff"
                        )
                        db.add(db_annotation)
                        generated_annotations.append(db_annotation)
    
    db.commit()
    
    return {
        "success": True,
        "message": f"成功生成{len(generated_annotations)}条标注",
        "annotation_count": len(generated_annotations)
    }


@router.post("/", response_model=AnnotationResponse)
def create_annotation(
    annotation: AnnotationCreate,
    db: Session = Depends(get_db)
):
    """创建标注"""
    # 验证文件是否存在
    file = db.query(File).filter(File.id == annotation.file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    # 创建标注
    db_annotation = Annotation(
        file_id=annotation.file_id,
        type=annotation.type,
        line_number=annotation.line_number,
        line_end=annotation.line_end,
        function_name=annotation.function_name,
        content=annotation.content,
        annotation_type=annotation.annotation_type,
        color=annotation.color or _get_color_for_type(annotation.annotation_type),
        status="pending"
    )
    
    db.add(db_annotation)
    db.commit()
    db.refresh(db_annotation)
    
    return AnnotationResponse.model_validate(db_annotation)


@router.get("/", response_model=List[AnnotationResponse])
def list_annotations(
    file_id: int = None,
    annotation_type: str = None,
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取标注列表"""
    query = db.query(Annotation)
    
    if file_id:
        query = query.filter(Annotation.file_id == file_id)
    if annotation_type:
        query = query.filter(Annotation.annotation_type == annotation_type)
    if status:
        query = query.filter(Annotation.status == status)
    
    annotations = query.offset(skip).limit(limit).all()
    return [AnnotationResponse.model_validate(ann) for ann in annotations]


@router.put("/{annotation_id}", response_model=AnnotationResponse)
def update_annotation(
    annotation_id: int,
    annotation_update: AnnotationUpdate,
    db: Session = Depends(get_db)
):
    """更新标注"""
    annotation = db.query(Annotation).filter(Annotation.id == annotation_id).first()
    if not annotation:
        raise HTTPException(status_code=404, detail="标注不存在")
    
    update_data = annotation_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(annotation, key, value)
    
    db.commit()
    db.refresh(annotation)
    
    return AnnotationResponse.model_validate(annotation)


@router.post("/{annotation_id}/approve")
def approve_annotation(annotation_id: int, db: Session = Depends(get_db)):
    """审核通过"""
    annotation = db.query(Annotation).filter(Annotation.id == annotation_id).first()
    if not annotation:
        raise HTTPException(status_code=404, detail="标注不存在")
    
    annotation.status = "approved"
    db.commit()
    
    return {"message": "审核通过"}


@router.post("/{annotation_id}/reject")
def reject_annotation(annotation_id: int, db: Session = Depends(get_db)):
    """审核拒绝"""
    annotation = db.query(Annotation).filter(Annotation.id == annotation_id).first()
    if not annotation:
        raise HTTPException(status_code=404, detail="标注不存在")
    
    annotation.status = "rejected"
    db.commit()
    
    return {"message": "审核拒绝"}


@router.delete("/{annotation_id}")
def delete_annotation(annotation_id: int, db: Session = Depends(get_db)):
    """删除标注"""
    annotation = db.query(Annotation).filter(Annotation.id == annotation_id).first()
    if not annotation:
        raise HTTPException(status_code=404, detail="标注不存在")
    
    db.delete(annotation)
    db.commit()
    
    return {"message": "标注已删除"}


def _get_color_for_type(annotation_type: str) -> str:
    """根据标注类型获取颜色"""
    color_map = {
        'info': '#1890ff',      # 蓝色
        'warning': '#faad14',   # 黄色
        'suggestion': '#52c41a', # 绿色
        'security': '#f5222d'   # 红色
    }
    return color_map.get(annotation_type, '#1890ff')


def _build_function_annotation_content(func_data: dict) -> str:
    """构建函数标注内容"""
    lines = []
    
    if 'description' in func_data:
        lines.append(f"功能: {func_data['description']}")
    
    if 'parameters' in func_data and func_data['parameters']:
        lines.append("\n参数:")
        for param in func_data['parameters']:
            lines.append(f"  - {param.get('name')}: {param.get('description')} ({param.get('type', '')})")
    
    if 'returns' in func_data and func_data['returns']:
        ret = func_data['returns']
        lines.append(f"\n返回: {ret.get('description')} ({ret.get('type', '')})")
    
    if 'example' in func_data and func_data['example']:
        lines.append(f"\n示例:\n{func_data['example']}")
    
    return '\n'.join(lines)


