"""
项目Schemas
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class ProjectBase(BaseModel):
    """项目基础Schema"""
    name: str
    description: Optional[str] = None
    language: Optional[str] = None
    settings: Optional[dict] = None


class ProjectCreate(ProjectBase):
    """创建项目Schema"""
    pass


class ProjectUpdate(BaseModel):
    """更新项目Schema"""
    name: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    status: Optional[str] = None
    settings: Optional[dict] = None


class ProjectResponse(ProjectBase):
    """项目响应Schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    file_count: Optional[int] = 0








