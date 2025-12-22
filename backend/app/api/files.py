"""
文件管理API
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile, Form
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import File, Project
from ..schemas.file import FileCreate, FileResponse
from ..services.file_service import file_service
from ..services.git_service import git_service

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/upload")
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    project_id: int = Form(...),
    db: Session = Depends(get_db)
):
    """上传单个文件"""
    # 检查项目是否存在
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    # 检查文件类型
    if not file_service.is_allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="不支持的文件类型")
    
    # 读取文件内容
    content_bytes = await file.read()
    try:
        content = content_bytes.decode('utf-8')
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="文件编码错误，请使用UTF-8编码")
    
    # 保存文件
    file_path = file_service.save_uploaded_file(content_bytes, file.filename, project_id)
    
    # 获取语言
    language = file_service.get_file_language(file.filename)
    
    # 保存到数据库
    db_file = File(
        project_id=project_id,
        filename=file.filename,
        filepath=file.filename,
        content=content,
        language=language,
        size=len(content_bytes)
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    response = FileResponse.model_validate(db_file)
    response.annotation_count = 0
    return response


@router.post("/git-import")
async def git_import(
    repo_url: str = Form(...),
    project_id: int = Form(...),
    db: Session = Depends(get_db)
):
    """从Git仓库导入代码"""
    # 检查项目是否存在
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    # 克隆仓库
    result = git_service.clone_repository(repo_url)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    # 保存文件到数据库
    saved_files = []
    for file_data in result['files']:
        language = file_service.get_file_language(file_data['filename'])
        
        db_file = File(
            project_id=project_id,
            filename=file_data['filename'],
            filepath=file_data['filepath'],
            content=file_data['content'],
            language=language,
            size=file_data['size']
        )
        db.add(db_file)
        saved_files.append(db_file)
    
    db.commit()
    
    # 清理临时目录
    git_service.cleanup_temp_dir(result['temp_dir'])
    
    return {
        "message": f"成功导入{len(saved_files)}个文件",
        "file_count": len(saved_files)
    }


@router.get("/{file_id}", response_model=FileResponse)
def get_file(file_id: int, db: Session = Depends(get_db)):
    """获取文件详情"""
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    response = FileResponse.model_validate(file)
    response.annotation_count = len(file.annotations)
    return response


@router.get("/project/{project_id}/list", response_model=List[FileResponse])
def list_project_files(project_id: int, db: Session = Depends(get_db)):
    """获取项目的文件列表"""
    files = db.query(File).filter(File.project_id == project_id).all()
    
    results = []
    for file in files:
        response = FileResponse.model_validate(file)
        response.annotation_count = len(file.annotations)
        results.append(response)
    
    return results


@router.delete("/{file_id}")
def delete_file(file_id: int, db: Session = Depends(get_db)):
    """删除文件"""
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    db.delete(file)
    db.commit()
    
    return {"message": "文件已删除"}









