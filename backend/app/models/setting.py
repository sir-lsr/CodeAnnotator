"""
系统设置模型
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, JSON
from ..database import Base


class LLMConfig(Base):
    """LLM配置表"""
    __tablename__ = "llm_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=False)  # openai, claude, ollama
    model_name = Column(String(100), nullable=False)
    api_key = Column(Text, nullable=True)  # 加密存储
    api_base_url = Column(String(255), nullable=True)  # 自定义API地址
    parameters = Column(JSON, nullable=True)  # 模型参数（temperature, max_tokens等）
    is_active = Column(Boolean, default=True)  # 是否启用

