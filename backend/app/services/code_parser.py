"""
代码解析服务 - 使用AST解析代码结构
"""
import ast
from typing import List, Dict, Optional


class CodeParser:
    """代码解析器"""
    
    @staticmethod
    def parse_python(code: str) -> Dict:
        """
        解析Python代码
        
        Args:
            code: Python代码字符串
            
        Returns:
            解析结果字典
        """
        try:
            tree = ast.parse(code)
            functions = []
            classes = []
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    func_info = {
                        'name': node.name,
                        'line_start': node.lineno,
                        'line_end': node.end_lineno,
                        'args': [arg.arg for arg in node.args.args],
                        'code': ast.get_source_segment(code, node) or ""
                    }
                    functions.append(func_info)
                
                elif isinstance(node, ast.ClassDef):
                    class_info = {
                        'name': node.name,
                        'line_start': node.lineno,
                        'line_end': node.end_lineno,
                        'code': ast.get_source_segment(code, node) or ""
                    }
                    classes.append(class_info)
            
            return {
                'success': True,
                'functions': functions,
                'classes': classes,
                'total_lines': len(code.split('\n'))
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'functions': [],
                'classes': [],
                'total_lines': len(code.split('\n'))
            }
    
    @staticmethod
    def parse_javascript(code: str) -> Dict:
        """
        解析JavaScript代码（简化版，使用正则表达式）
        
        Args:
            code: JavaScript代码字符串
            
        Returns:
            解析结果字典
        """
        import re
        
        functions = []
        
        # 匹配函数定义
        function_pattern = r'function\s+(\w+)\s*\([^)]*\)'
        arrow_pattern = r'const\s+(\w+)\s*=\s*\([^)]*\)\s*=>'
        
        lines = code.split('\n')
        
        for match in re.finditer(function_pattern, code):
            func_name = match.group(1)
            line_num = code[:match.start()].count('\n') + 1
            functions.append({
                'name': func_name,
                'line_start': line_num,
                'type': 'function'
            })
        
        for match in re.finditer(arrow_pattern, code):
            func_name = match.group(1)
            line_num = code[:match.start()].count('\n') + 1
            functions.append({
                'name': func_name,
                'line_start': line_num,
                'type': 'arrow_function'
            })
        
        return {
            'success': True,
            'functions': functions,
            'total_lines': len(lines)
        }
    
    @staticmethod
    def parse_code(code: str, language: str) -> Dict:
        """
        根据语言解析代码
        
        Args:
            code: 代码字符串
            language: 编程语言
            
        Returns:
            解析结果
        """
        language = language.lower()
        
        if language == 'python':
            return CodeParser.parse_python(code)
        elif language in ['javascript', 'typescript', 'js', 'ts']:
            return CodeParser.parse_javascript(code)
        else:
            # 对于其他语言，返回基本信息
            return {
                'success': True,
                'functions': [],
                'classes': [],
                'total_lines': len(code.split('\n')),
                'message': f'暂不支持{language}的详细解析'
            }


# 创建全局实例
code_parser = CodeParser()










