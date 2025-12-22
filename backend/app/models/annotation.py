"""
标注模型
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Annotation(Base):
    """标注表"""
    __tablename__ = "annotations"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    type = Column(String(20), nullable=False)  # line（行内）, function（函数）
    line_number = Column(Integer, nullable=True)  # 行号（行内标注用）
    line_end = Column(Integer, nullable=True)  # 结束行号（函数标注用）
    function_name = Column(String(200), nullable=True)  # 函数名
    content = Column(Text, nullable=False)  # 标注内容
    annotation_type = Column(String(50), nullable=False)  # info, warning, suggestion, security
    status = Column(String(20), default="pending")  # pending, approved, rejected
    color = Column(String(20), nullable=True)  # 颜色标识
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # 关系
    file = relationship("File", back_populates="annotations")


class AnnotationType(Base):
    """标注类型配置表"""
    __tablename__ = "annotation_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    color = Column(String(20), default="#1890ff")
    icon = Column(String(50), nullable=True)
    priority = Column(Integer, default=0)  # 优先级，数字越大越重要
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

