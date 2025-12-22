"""
Git仓库处理服务
"""
import os
import tempfile
import shutil
from pathlib import Path
from typing import List, Dict
from git import Repo, GitCommandError


class GitService:
    """Git服务类"""
    
    @staticmethod
    def clone_repository(repo_url: str) -> Dict:
        """
        克隆Git仓库
        
        Args:
            repo_url: Git仓库URL
            
        Returns:
            克隆结果字典
        """
        try:
            # 创建临时目录
            temp_dir = tempfile.mkdtemp()
            
            # 克隆仓库
            repo = Repo.clone_from(repo_url, temp_dir, depth=1)
            
            # 获取文件列表
            files = GitService._get_code_files(temp_dir)
            
            return {
                'success': True,
                'temp_dir': temp_dir,
                'files': files,
                'message': f'成功克隆仓库，找到{len(files)}个代码文件'
            }
        
        except GitCommandError as e:
            return {
                'success': False,
                'error': f'Git克隆失败: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'处理失败: {str(e)}'
            }
    
    @staticmethod
    def _get_code_files(directory: str) -> List[Dict]:
        """
        获取目录中的代码文件
        
        Args:
            directory: 目录路径
            
        Returns:
            文件信息列表
        """
        code_extensions = {
            '.py', '.js', '.ts', '.jsx', '.tsx',
            '.java', '.cpp', '.c', '.h', '.hpp',
            '.go', '.rs', '.rb', '.php', '.cs',
            '.swift', '.kt', '.scala', '.sql'
        }
        
        files = []
        dir_path = Path(directory)
        
        for file_path in dir_path.rglob('*'):
            if file_path.is_file() and file_path.suffix in code_extensions:
                # 跳过隐藏文件和特殊目录
                if any(part.startswith('.') for part in file_path.parts):
                    continue
                if any(part in ['node_modules', '__pycache__', 'venv', 'dist', 'build'] for part in file_path.parts):
                    continue
                
                try:
                    relative_path = file_path.relative_to(dir_path)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    files.append({
                        'filename': file_path.name,
                        'filepath': str(relative_path),
                        'content': content,
                        'size': file_path.stat().st_size
                    })
                except Exception as e:
                    # 跳过无法读取的文件
                    continue
        
        return files
    
    @staticmethod
    def cleanup_temp_dir(temp_dir: str):
        """
        清理临时目录
        
        Args:
            temp_dir: 临时目录路径
        """
        try:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
        except Exception as e:
            print(f"清理临时目录失败: {e}")


# 创建全局实例
git_service = GitService()









