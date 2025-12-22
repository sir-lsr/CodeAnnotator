"""
文件Schemas
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class FileBase(BaseModel):
    """文件基础Schema"""
    filename: str
    filepath: Optional[str] = None
    content: str
    language: Optional[str] = None


class FileCreate(FileBase):
    """创建文件Schema"""
    project_id: int


class FileResponse(FileBase):
    """文件响应Schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    project_id: int
    size: Optional[int] = None
    created_at: datetime
    annotation_count: Optional[int] = 0










