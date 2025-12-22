"""
LLM相关Schemas
"""
from pydantic import BaseModel
from typing import Optional, List


class LLMGenerateRequest(BaseModel):
    """LLM生成请求"""
    file_id: int
    generate_line_annotations: bool = True
    generate_function_annotations: bool = True


class LineAnnotationData(BaseModel):
    """行内标注数据"""
    line: int
    type: str
    content: str


class FunctionAnnotationData(BaseModel):
    """函数标注数据"""
    function_name: str
    line_start: int
    line_end: int
    description: str
    parameters: List[dict] = []
    returns: Optional[dict] = None
    example: Optional[str] = None


class LLMGenerateResponse(BaseModel):
    """LLM生成响应"""
    success: bool
    message: Optional[str] = None
    line_annotations: List[LineAnnotationData] = []
    function_annotations: List[FunctionAnnotationData] = []










