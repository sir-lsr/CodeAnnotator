"""
项目模型
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Project(Base):
    """项目表"""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    language = Column(String(50), nullable=True)  # python, javascript, java等
    status = Column(String(20), default="active")  # active, archived
    settings = Column(JSON, nullable=True)  # 项目配置
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # 关系
    files = relationship("File", back_populates="project", cascade="all, delete-orphan")

