"""
标注类型管理API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.annotation import AnnotationType
from ..schemas.annotation import AnnotationTypeCreate, AnnotationTypeUpdate, AnnotationTypeResponse

router = APIRouter(prefix="/annotation-types", tags=["annotation-types"])


@router.get("/", response_model=List[AnnotationTypeResponse])
def list_annotation_types(db: Session = Depends(get_db)):
    """获取所有标注类型"""
    types = db.query(AnnotationType).order_by(AnnotationType.priority.desc()).all()
    return types


@router.post("/", response_model=AnnotationTypeResponse)
def create_annotation_type(
    annotation_type: AnnotationTypeCreate,
    db: Session = Depends(get_db)
):
    """创建标注类型"""
    # 检查名称是否已存在
    existing = db.query(AnnotationType).filter(AnnotationType.name == annotation_type.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="该标注类型名称已存在")
    
    db_type = AnnotationType(**annotation_type.model_dump())
    db.add(db_type)
    db.commit()
    db.refresh(db_type)
    return db_type


@router.get("/{type_id}", response_model=AnnotationTypeResponse)
def get_annotation_type(type_id: int, db: Session = Depends(get_db)):
    """获取标注类型详情"""
    annotation_type = db.query(AnnotationType).filter(AnnotationType.id == type_id).first()
    if not annotation_type:
        raise HTTPException(status_code=404, detail="标注类型不存在")
    return annotation_type


@router.put("/{type_id}", response_model=AnnotationTypeResponse)
def update_annotation_type(
    type_id: int,
    annotation_type_update: AnnotationTypeUpdate,
    db: Session = Depends(get_db)
):
    """更新标注类型"""
    annotation_type = db.query(AnnotationType).filter(AnnotationType.id == type_id).first()
    if not annotation_type:
        raise HTTPException(status_code=404, detail="标注类型不存在")
    
    update_data = annotation_type_update.model_dump(exclude_unset=True)
    
    # 如果更新名称，检查是否重复
    if 'name' in update_data:
        existing = db.query(AnnotationType).filter(
            AnnotationType.name == update_data['name'],
            AnnotationType.id != type_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="该标注类型名称已存在")
    
    for key, value in update_data.items():
        setattr(annotation_type, key, value)
    
    db.commit()
    db.refresh(annotation_type)
    return annotation_type


@router.delete("/{type_id}")
def delete_annotation_type(type_id: int, db: Session = Depends(get_db)):
    """删除标注类型"""
    annotation_type = db.query(AnnotationType).filter(AnnotationType.id == type_id).first()
    if not annotation_type:
        raise HTTPException(status_code=404, detail="标注类型不存在")
    
    db.delete(annotation_type)
    db.commit()
    return {"message": "标注类型已删除"}


@router.post("/init-defaults")
def init_default_types(db: Session = Depends(get_db)):
    """初始化默认标注类型"""
    default_types = [
        {
            "name": "info",
            "color": "#1890ff",
            "icon": "InfoCircle",
            "priority": 1
        },
        {
            "name": "warning",
            "color": "#faad14",
            "icon": "Warning",
            "priority": 3
        },
        {
            "name": "suggestion",
            "color": "#52c41a",
            "icon": "Bulb",
            "priority": 2
        },
        {
            "name": "security",
            "color": "#f5222d",
            "icon": "Lock",
            "priority": 4
        }
    ]
    
    created_count = 0
    for type_data in default_types:
        existing = db.query(AnnotationType).filter(AnnotationType.name == type_data['name']).first()
        if not existing:
            db_type = AnnotationType(**type_data)
            db.add(db_type)
            created_count += 1
    
    db.commit()
    return {
        "message": f"成功初始化{created_count}个默认标注类型",
        "created_count": created_count
    }
