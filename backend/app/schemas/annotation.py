"""
标注Schemas
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class AnnotationBase(BaseModel):
    """标注基础Schema"""
    type: str  # line, function
    line_number: Optional[int] = None
    line_end: Optional[int] = None
    function_name: Optional[str] = None
    content: str
    annotation_type: str  # info, warning, suggestion, security
    color: Optional[str] = None


class AnnotationCreate(AnnotationBase):
    """创建标注Schema"""
    file_id: int


class AnnotationUpdate(BaseModel):
    """更新标注Schema"""
    content: Optional[str] = None
    annotation_type: Optional[str] = None
    status: Optional[str] = None
    color: Optional[str] = None


class AnnotationResponse(AnnotationBase):
    """标注响应Schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    file_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None


# 标注类型相关Schema
class AnnotationTypeBase(BaseModel):
    """标注类型基础Schema"""
    name: str
    color: str
    icon: Optional[str] = None
    priority: int = 1


class AnnotationTypeCreate(AnnotationTypeBase):
    """创建标注类型Schema"""
    pass


class AnnotationTypeUpdate(BaseModel):
    """更新标注类型Schema"""
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    priority: Optional[int] = None


class AnnotationTypeResponse(AnnotationTypeBase):
    """标注类型响应Schema"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None









