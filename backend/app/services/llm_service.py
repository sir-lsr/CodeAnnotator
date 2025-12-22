"""
LLM服务 - 调用大语言模型
"""
import json
import requests
from typing import Dict, List, Optional
from openai import OpenAI
import anthropic
from ..config import settings


class LLMService:
    """LLM服务类"""
    
    def __init__(self, provider: str = None, model: str = None, openai_api_key: str = None, openai_base_url: str = None, anthropic_api_key: str = None):
        self.provider = provider or settings.DEFAULT_LLM_PROVIDER
        self.model = model or settings.DEFAULT_MODEL
        self.openai_client = None
        self.anthropic_client = None
        self.ollama_url = "http://localhost:11434"  # Ollama 默认地址
        
        # 使用传入的 API key，如果没有则使用配置文件中的
        final_openai_key = openai_api_key or settings.OPENAI_API_KEY
        final_openai_base_url = openai_base_url or settings.OPENAI_BASE_URL
        final_anthropic_key = anthropic_api_key or settings.ANTHROPIC_API_KEY
        
        if final_openai_key:
            # 支持自定义 OpenAI API 地址
            openai_kwargs = {
                "api_key": final_openai_key,
                "timeout": 180.0  # 设置 3 分钟超时，适配 DeepSeek 等较慢的 API
            }
            if final_openai_base_url:
                openai_kwargs["base_url"] = final_openai_base_url
            self.openai_client = OpenAI(**openai_kwargs)
        
        if final_anthropic_key:
            self.anthropic_client = anthropic.Anthropic(api_key=final_anthropic_key)
    
    def generate_line_annotations(self, code: str, language: str) -> Dict:
        """
        生成行内标注
        
        Args:
            code: 代码内容
            language: 编程语言
            
        Returns:
            标注数据字典
        """
        prompt = self._build_line_annotation_prompt(code, language)
        
        try:
            # 使用 Ollama
            if self.provider == "ollama":
                return self._call_ollama(prompt)
            
            # 使用 OpenAI
            elif self.provider == "openai" and self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "你是一个专业的代码审查专家，擅长分析代码并提供有价值的注释。"},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    response_format={"type": "json_object"}
                )
                
                result = response.choices[0].message.content
                return json.loads(result)
            
            # 使用 Anthropic
            elif self.provider == "anthropic" and self.anthropic_client:
                message = self.anthropic_client.messages.create(
                    model=self.model,
                    max_tokens=2000,
                    temperature=0.3,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                result = message.content[0].text
                return json.loads(result)
            
            else:
                return {"error": f"未配置 {self.provider} LLM 或 API 密钥无效"}
                
        except Exception as e:
            return self._handle_llm_error(e)
    
    def generate_function_annotations(self, function_code: str, language: str, function_name: str) -> Dict:
        """
        生成函数标注
        
        Args:
            function_code: 函数代码
            language: 编程语言
            function_name: 函数名
            
        Returns:
            标注数据字典
        """
        prompt = self._build_function_annotation_prompt(function_code, language)
        
        try:
            # 使用 Ollama
            if self.provider == "ollama":
                return self._call_ollama(prompt)
            
            # 使用 OpenAI
            elif self.provider == "openai" and self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "你是一个专业的代码文档生成专家。"},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    response_format={"type": "json_object"}
                )
                
                result = response.choices[0].message.content
                return json.loads(result)
            
            # 使用 Anthropic
            elif self.provider == "anthropic" and self.anthropic_client:
                message = self.anthropic_client.messages.create(
                    model=self.model,
                    max_tokens=2000,
                    temperature=0.3,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                result = message.content[0].text
                return json.loads(result)
            
            else:
                return {"error": f"未配置 {self.provider} LLM 或 API 密钥无效"}
                
        except Exception as e:
            return self._handle_llm_error(e)
    
    def _call_ollama(self, prompt: str) -> Dict:
        """
        调用 Ollama API
        
        Args:
            prompt: 提示词
            
        Returns:
            标注数据字典
        """
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model or "codellama:7b",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                    }
                },
                timeout=120  # Ollama 可能需要较长时间
            )
            
            if response.status_code == 200:
                result = response.json()
                response_text = result.get("response", "")
                
                # 尝试解析 JSON
                try:
                    # 提取 JSON 部分（可能包含在 markdown 代码块中）
                    if "```json" in response_text:
                        json_str = response_text.split("```json")[1].split("```")[0].strip()
                    elif "```" in response_text:
                        json_str = response_text.split("```")[1].split("```")[0].strip()
                    else:
                        json_str = response_text.strip()
                    
                    return json.loads(json_str)
                except json.JSONDecodeError:
                    # 如果无法解析 JSON，返回原始响应
                    return {
                        "error": "Ollama 返回的不是有效的 JSON 格式",
                        "raw_response": response_text[:500]
                    }
            else:
                return {
                    "error": f"Ollama API 调用失败: HTTP {response.status_code}",
                    "detail": response.text
                }
                
        except requests.exceptions.ConnectionError:
            return {
                "error": "无法连接到 Ollama 服务 🔌",
                "detail": "请确保 Ollama 正在运行\n运行命令: ollama serve",
                "solution": "1. 启动 Ollama 服务\n2. 或检查 Ollama 是否已安装"
            }
        except requests.exceptions.Timeout:
            return {
                "error": "Ollama 响应超时 ⏱️",
                "detail": "模型处理时间过长，请稍后重试",
                "solution": "1. 使用更小的代码片段\n2. 或使用更快的模型"
            }
        except Exception as e:
            return {
                "error": "Ollama 调用失败",
                "detail": str(e)
            }
    
    def _handle_llm_error(self, error: Exception) -> Dict:
        """处理 LLM 错误，返回友好的错误信息"""
        error_msg = str(error)
        
        # 超时错误
        if "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
            return {
                "error": "API 响应超时 ⏱️",
                "detail": "AI 模型处理时间过长，请尝试以下方法：",
                "solution": "1. 减少代码文件大小（分批处理）\n2. 稍后重试\n3. 检查网络连接\n4. 考虑切换到更快的模型",
                "error_code": "timeout"
            }
        # 429 - 余额不足
        elif "insufficient_quota" in error_msg or "429" in error_msg:
            return {
                "error": "API 账户余额不足 💰",
                "detail": "请访问服务商网站充值账户或在设置中切换到免费的 Ollama 本地方案",
                "solution": "1. 充值账户\n2. 或使用免费的 Ollama（查看文档：快速使用Ollama.md）",
                "error_code": "insufficient_quota"
            }
        # 401 - 密钥无效
        elif "invalid_api_key" in error_msg or "401" in error_msg or "Unauthorized" in error_msg:
            return {
                "error": "API 密钥无效 🔑",
                "detail": "请在设置页面检查并更新您的 API 密钥",
                "solution": "1. 确认 API 密钥正确\n2. 确认 API 地址正确\n3. 检查密钥是否过期",
                "error_code": "invalid_api_key"
            }
        # 429 - 速率限制
        elif "rate_limit" in error_msg:
            return {
                "error": "API 调用频率过快 ⏱️",
                "detail": "请稍后再试，或升级账户以获得更高限额",
                "error_code": "rate_limit"
            }
        # 其他错误
        else:
            return {
                "error": "LLM 调用失败",
                "detail": error_msg,
                "solution": "请检查网络连接和 API 配置"
            }
    
    def _build_line_annotation_prompt(self, code: str, language: str) -> str:
        """构建行内标注提示词"""
        return f"""你是一个专业的代码审查专家。请为以下{language}代码添加行内注释。

代码内容:
```{language}
{code}
```

要求:
1. 为重要的代码行添加简洁的中文注释（不需要每行都标注）
2. 标注类型包括:
   - info: 功能说明和代码解释
   - warning: 潜在问题或需要注意的地方
   - suggestion: 优化建议
   - security: 安全相关提示
3. 只标注真正重要的行（约10-20%的代码行）
4. 返回严格的JSON格式

返回格式示例:
{{
  "annotations": [
    {{
      "line": 5,
      "type": "info",
      "content": "初始化数据库连接池"
    }},
    {{
      "line": 12,
      "type": "warning",
      "content": "未进行输入验证，可能存在注入风险"
    }}
  ]
}}

请直接返回JSON，不要有其他文字。"""
    
    def _build_function_annotation_prompt(self, function_code: str, language: str) -> str:
        """构建函数标注提示词"""
        return f"""你是一个专业的代码文档生成专家。请为以下{language}函数生成详细的文档。

函数代码:
```{language}
{function_code}
```

要求:
1. 生成清晰的中文函数功能描述
2. 说明每个参数的名称、类型和用途
3. 说明返回值的类型和含义
4. 如果可能，提供一个简单的使用示例
5. 返回严格的JSON格式

返回格式示例:
{{
  "function_name": "calculate_total",
  "description": "计算订单总价，包含税费和折扣",
  "parameters": [
    {{
      "name": "items",
      "type": "List[Item]",
      "description": "订单商品列表"
    }},
    {{
      "name": "discount",
      "type": "float",
      "description": "折扣率，范围0-1"
    }}
  ],
  "returns": {{
    "type": "float",
    "description": "计算后的总价"
  }},
  "example": "total = calculate_total(items, 0.1)  # 应用10%折扣"
}}

请直接返回JSON，不要有其他文字。"""


# 创建全局实例（默认配置）
llm_service = LLMService()

# 辅助函数：根据设置创建 LLM 服务实例
def get_llm_service(provider: str = None, model: str = None, openai_api_key: str = None, openai_base_url: str = None, anthropic_api_key: str = None) -> LLMService:
    """
    获取 LLM 服务实例
    
    Args:
        provider: LLM 提供商 (openai, anthropic, ollama)
        model: 模型名称
        openai_api_key: OpenAI API 密钥
        openai_base_url: OpenAI API 基础 URL (支持 DeepSeek 等兼容服务)
        anthropic_api_key: Anthropic API 密钥
        
    Returns:
        LLMService 实例
    """
    return LLMService(provider=provider, model=model, openai_api_key=openai_api_key, openai_base_url=openai_base_url, anthropic_api_key=anthropic_api_key)


