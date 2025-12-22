"""
设置API路由
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import json
import os

router = APIRouter(prefix="/settings", tags=["settings"])

# 设置文件路径
SETTINGS_FILE = "user_settings.json"

class UserSettings(BaseModel):
    """用户设置模型"""
    theme: str = "light"
    language: str = "zh"
    autoSave: bool = True
    fontSize: int = 14
    editorTheme: str = "vs-dark"
    llmProvider: str = "openai"
    llmModel: str = "gpt-3.5-turbo"
    openaiApiKey: Optional[str] = ""
    openaiBaseUrl: Optional[str] = ""  # 支持自定义 API 地址（如 DeepSeek）
    anthropicApiKey: Optional[str] = ""

def load_settings() -> dict:
    """加载设置"""
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return UserSettings().dict()

def save_settings(settings: dict) -> None:
    """保存设置"""
    with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(settings, f, ensure_ascii=False, indent=2)

@router.get("")
async def get_settings():
    """获取用户设置"""
    try:
        settings = load_settings()
        return {"success": True, "data": settings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("")
async def update_settings(settings: UserSettings):
    """更新用户设置"""
    try:
        save_settings(settings.dict())
        return {"success": True, "message": "设置保存成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reset")
async def reset_settings():
    """重置为默认设置"""
    try:
        default_settings = UserSettings().dict()
        save_settings(default_settings)
        return {"success": True, "data": default_settings, "message": "设置已重置"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-api")
async def test_api_connection(settings: UserSettings):
    """测试 LLM API 连接"""
    try:
        if settings.llmProvider == "openai":
            if not settings.openaiApiKey:
                raise HTTPException(status_code=400, detail="请提供 OpenAI API 密钥")
            
            # 测试 OpenAI API（支持 DeepSeek 等兼容服务）
            from openai import OpenAI
            client_kwargs = {"api_key": settings.openaiApiKey}
            if settings.openaiBaseUrl:
                client_kwargs["base_url"] = settings.openaiBaseUrl
            client = OpenAI(**client_kwargs)
            
            # 发送一个简单的测试请求
            response = client.chat.completions.create(
                model=settings.llmModel,
                messages=[{"role": "user", "content": "测试"}],
                max_tokens=5
            )
            
            provider_name = "DeepSeek" if settings.openaiBaseUrl and "deepseek" in settings.openaiBaseUrl.lower() else "OpenAI"
            
            return {
                "success": True, 
                "message": f"{provider_name} API 连接成功",
                "model": settings.llmModel
            }
            
        elif settings.llmProvider == "anthropic":
            if not settings.anthropicApiKey:
                raise HTTPException(status_code=400, detail="请提供 Anthropic API 密钥")
            
            # 测试 Anthropic API
            import anthropic
            client = anthropic.Anthropic(api_key=settings.anthropicApiKey)
            
            # 发送一个简单的测试请求
            message = client.messages.create(
                model=settings.llmModel,
                max_tokens=5,
                messages=[{"role": "user", "content": "测试"}]
            )
            
            return {
                "success": True,
                "message": "Anthropic API 连接成功",
                "model": settings.llmModel
            }
        else:
            return {"success": True, "message": "Ollama 本地模式无需测试"}
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"API 连接失败: {str(e)}")

