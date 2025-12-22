"""
文件模型
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class File(Base):
    """文件表"""
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=True)  # 相对路径
    content = Column(Text, nullable=False)  # 文件内容
    language = Column(String(50), nullable=True)  # 文件语言
    size = Column(Integer, nullable=True)  # 文件大小（字节）
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    project = relationship("Project", back_populates="files")
    annotations = relationship("Annotation", back_populates="file", cascade="all, delete-orphan")

