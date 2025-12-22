"""
应用配置文件
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """应用设置"""
    
    # 应用基础配置
    APP_NAME: str = "CodeAnnotator"
    DEBUG: bool = True
    API_PREFIX: str = "/api"
    
    # 数据库配置
    DATABASE_URL: str = "sqlite:///./database.db"
    
    # LLM API配置
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: Optional[str] = None  # 自定义 OpenAI API 地址
    ANTHROPIC_API_KEY: Optional[str] = None
    DEFAULT_LLM_PROVIDER: str = "openai"  # openai, anthropic, ollama
    DEFAULT_MODEL: str = "gpt-3.5-turbo"
    
    # 文件上传配置
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: list = [
        ".py", ".js", ".ts", ".jsx", ".tsx",
        ".java", ".cpp", ".c", ".h", ".hpp",
        ".go", ".rs", ".rb", ".php", ".cs",
        ".swift", ".kt", ".scala", ".sql"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

