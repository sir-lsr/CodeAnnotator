"""
质量评估Schemas
"""
from pydantic import BaseModel
from typing import List, Optional


class FileQualityMetrics(BaseModel):
    """文件质量指标"""
    file_id: int
    filename: str
    filepath: Optional[str] = None
    total_lines: int
    annotated_lines: int
    coverage: float  # 覆盖率（0-100）
    total_annotations: int
    info_count: int
    warning_count: int
    suggestion_count: int
    security_count: int
    issue_density: float  # 问题密度（问题数/百行代码）
    quality_score: float  # 质量得分（0-100）
    quality_grade: str  # 质量等级（A+, A, B, C, D）


class ProjectQualityMetrics(BaseModel):
    """项目质量指标"""
    project_id: int
    project_name: str
    total_files: int
    total_lines: int
    annotated_lines: int
    coverage: float  # 覆盖率（0-100）
    total_annotations: int
    info_count: int
    warning_count: int
    suggestion_count: int
    security_count: int
    pending_count: int
    approved_count: int
    rejected_count: int
    issue_density: float  # 问题密度（问题数/百行代码）
    quality_score: float  # 质量得分（0-100）
    quality_grade: str  # 质量等级（A+, A, B, C, D）
    file_metrics: List[FileQualityMetrics]


class QualitySummary(BaseModel):
    """质量摘要"""
    total_projects: int
    total_files: int
    total_annotations: int
    average_quality_score: float
    high_quality_files: int  # 质量得分>=80的文件数
    medium_quality_files: int  # 质量得分60-80的文件数
    low_quality_files: int  # 质量得分<60的文件数


class QualityTrend(BaseModel):
    """质量趋势"""
    date: str
    quality_score: float
    annotation_count: int
