"""
文件处理服务
"""
import os
from pathlib import Path
from typing import Optional
from ..config import settings


class FileService:
    """文件服务类"""
    
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    def save_uploaded_file(self, file_content: bytes, filename: str, project_id: int) -> str:
        """
        保存上传的文件
        
        Args:
            file_content: 文件内容
            filename: 文件名
            project_id: 项目ID
            
        Returns:
            保存的文件路径
        """
        project_dir = self.upload_dir / str(project_id)
        project_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = project_dir / filename
        
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        return str(file_path)
    
    def get_file_language(self, filename: str) -> Optional[str]:
        """
        根据文件扩展名获取编程语言
        
        Args:
            filename: 文件名
            
        Returns:
            语言名称
        """
        ext_map = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.jsx': 'javascript',
            '.tsx': 'typescript',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.h': 'c',
            '.hpp': 'cpp',
            '.go': 'go',
            '.rs': 'rust',
            '.rb': 'ruby',
            '.php': 'php',
            '.cs': 'csharp',
            '.swift': 'swift',
            '.kt': 'kotlin'
        }
        
        ext = Path(filename).suffix.lower()
        return ext_map.get(ext, 'text')
    
    def is_allowed_file(self, filename: str) -> bool:
        """
        检查文件是否允许上传
        
        Args:
            filename: 文件名
            
        Returns:
            是否允许
        """
        ext = Path(filename).suffix.lower()
        return ext in settings.ALLOWED_EXTENSIONS


# 创建全局实例
file_service = FileService()











