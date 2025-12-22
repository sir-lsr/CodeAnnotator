"""
质量评估API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.quality import (
    FileQualityMetrics,
    ProjectQualityMetrics,
    QualitySummary
)
from ..services.quality_service import quality_service

router = APIRouter(prefix="/quality", tags=["quality"])


@router.get("/file/{file_id}", response_model=FileQualityMetrics)
def get_file_quality(file_id: int, db: Session = Depends(get_db)):
    """获取文件质量评估"""
    result = quality_service.calculate_file_quality(file_id, db)
    if not result:
        raise HTTPException(status_code=404, detail="文件不存在")
    return result


@router.get("/project/{project_id}", response_model=ProjectQualityMetrics)
def get_project_quality(project_id: int, db: Session = Depends(get_db)):
    """获取项目质量评估"""
    result = quality_service.calculate_project_quality(project_id, db)
    if not result:
        raise HTTPException(status_code=404, detail="项目不存在")
    return result


@router.get("/summary", response_model=QualitySummary)
def get_quality_summary(db: Session = Depends(get_db)):
    """获取质量摘要"""
    return quality_service.get_quality_summary(db)
