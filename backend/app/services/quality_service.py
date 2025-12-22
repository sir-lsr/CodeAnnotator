"""
质量评估服务
"""
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Project, File, Annotation


class QualityService:
    """质量评估服务类"""
    
    @staticmethod
    def calculate_file_quality(file_id: int, db: Session) -> dict:
        """计算单个文件的质量指标"""
        file = db.query(File).filter(File.id == file_id).first()
        if not file:
            return None
        
        # 获取文件的所有标注
        annotations = db.query(Annotation).filter(Annotation.file_id == file_id).all()
        
        # 统计行数
        total_lines = len(file.content.split('\n')) if file.content else 0
        
        # 统计标注覆盖的行数（去重）
        annotated_lines_set = set()
        for ann in annotations:
            if ann.line_number:
                if ann.line_end:
                    # 函数标注，覆盖多行
                    for line in range(ann.line_number, ann.line_end + 1):
                        annotated_lines_set.add(line)
                else:
                    # 行内标注
                    annotated_lines_set.add(ann.line_number)
        
        annotated_lines = len(annotated_lines_set)
        
        # 计算覆盖率
        coverage = (annotated_lines / total_lines * 100) if total_lines > 0 else 0
        
        # 统计各类型标注数量
        info_count = sum(1 for ann in annotations if ann.annotation_type == 'info')
        warning_count = sum(1 for ann in annotations if ann.annotation_type == 'warning')
        suggestion_count = sum(1 for ann in annotations if ann.annotation_type == 'suggestion')
        security_count = sum(1 for ann in annotations if ann.annotation_type == 'security')
        
        # 计算问题密度（问题数/百行代码）
        issue_count = warning_count + security_count
        issue_density = (issue_count / total_lines * 100) if total_lines > 0 else 0
        
        # 计算质量得分（0-100）
        quality_score = QualityService._calculate_quality_score(
            coverage=coverage,
            issue_density=issue_density,
            security_count=security_count,
            warning_count=warning_count,
            suggestion_count=suggestion_count,
            total_lines=total_lines
        )
        
        # 计算质量等级
        quality_grade = QualityService._get_quality_grade(quality_score)
        
        return {
            'file_id': file.id,
            'filename': file.filename,
            'filepath': file.filepath,
            'total_lines': total_lines,
            'annotated_lines': annotated_lines,
            'coverage': round(coverage, 2),
            'total_annotations': len(annotations),
            'info_count': info_count,
            'warning_count': warning_count,
            'suggestion_count': suggestion_count,
            'security_count': security_count,
            'issue_density': round(issue_density, 2),
            'quality_score': round(quality_score, 2),
            'quality_grade': quality_grade
        }
    
    @staticmethod
    def calculate_project_quality(project_id: int, db: Session) -> dict:
        """计算项目的质量指标"""
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return None
        
        # 获取项目的所有文件
        files = db.query(File).filter(File.project_id == project_id).all()
        
        if not files:
            return {
                'project_id': project.id,
                'project_name': project.name,
                'total_files': 0,
                'total_lines': 0,
                'annotated_lines': 0,
                'coverage': 0,
                'total_annotations': 0,
                'info_count': 0,
                'warning_count': 0,
                'suggestion_count': 0,
                'security_count': 0,
                'pending_count': 0,
                'approved_count': 0,
                'rejected_count': 0,
                'issue_density': 0,
                'quality_score': 0,
                'quality_grade': 'N/A',
                'file_metrics': []
            }
        
        # 计算每个文件的质量指标
        file_metrics = []
        total_lines = 0
        total_annotated_lines = 0
        total_annotations = 0
        info_count = 0
        warning_count = 0
        suggestion_count = 0
        security_count = 0
        pending_count = 0
        approved_count = 0
        rejected_count = 0
        
        for file in files:
            file_quality = QualityService.calculate_file_quality(file.id, db)
            if file_quality:
                file_metrics.append(file_quality)
                total_lines += file_quality['total_lines']
                total_annotated_lines += file_quality['annotated_lines']
                total_annotations += file_quality['total_annotations']
                info_count += file_quality['info_count']
                warning_count += file_quality['warning_count']
                suggestion_count += file_quality['suggestion_count']
                security_count += file_quality['security_count']
        
        # 统计标注状态
        annotations = db.query(Annotation).join(File).filter(File.project_id == project_id).all()
        for ann in annotations:
            if ann.status == 'pending':
                pending_count += 1
            elif ann.status == 'approved':
                approved_count += 1
            elif ann.status == 'rejected':
                rejected_count += 1
        
        # 计算项目整体覆盖率
        coverage = (total_annotated_lines / total_lines * 100) if total_lines > 0 else 0
        
        # 计算项目整体问题密度
        issue_count = warning_count + security_count
        issue_density = (issue_count / total_lines * 100) if total_lines > 0 else 0
        
        # 计算项目整体质量得分（基于所有文件的平均分）
        if file_metrics:
            quality_score = sum(f['quality_score'] for f in file_metrics) / len(file_metrics)
        else:
            quality_score = 0
        
        # 计算质量等级
        quality_grade = QualityService._get_quality_grade(quality_score)
        
        return {
            'project_id': project.id,
            'project_name': project.name,
            'total_files': len(files),
            'total_lines': total_lines,
            'annotated_lines': total_annotated_lines,
            'coverage': round(coverage, 2),
            'total_annotations': total_annotations,
            'info_count': info_count,
            'warning_count': warning_count,
            'suggestion_count': suggestion_count,
            'security_count': security_count,
            'pending_count': pending_count,
            'approved_count': approved_count,
            'rejected_count': rejected_count,
            'issue_density': round(issue_density, 2),
            'quality_score': round(quality_score, 2),
            'quality_grade': quality_grade,
            'file_metrics': file_metrics
        }
    
    @staticmethod
    def get_quality_summary(db: Session) -> dict:
        """获取质量摘要"""
        # 统计总项目数
        total_projects = db.query(Project).count()
        
        # 统计总文件数
        total_files = db.query(File).count()
        
        # 统计总标注数
        total_annotations = db.query(Annotation).count()
        
        # 计算所有文件的质量得分
        files = db.query(File).all()
        quality_scores = []
        high_quality_files = 0
        medium_quality_files = 0
        low_quality_files = 0
        
        for file in files:
            file_quality = QualityService.calculate_file_quality(file.id, db)
            if file_quality:
                score = file_quality['quality_score']
                quality_scores.append(score)
                
                if score >= 80:
                    high_quality_files += 1
                elif score >= 60:
                    medium_quality_files += 1
                else:
                    low_quality_files += 1
        
        # 计算平均质量得分
        average_quality_score = sum(quality_scores) / len(quality_scores) if quality_scores else 0
        
        return {
            'total_projects': total_projects,
            'total_files': total_files,
            'total_annotations': total_annotations,
            'average_quality_score': round(average_quality_score, 2),
            'high_quality_files': high_quality_files,
            'medium_quality_files': medium_quality_files,
            'low_quality_files': low_quality_files
        }
    
    @staticmethod
    def _calculate_quality_score(
        coverage: float,
        issue_density: float,
        security_count: int,
        warning_count: int,
        suggestion_count: int,
        total_lines: int
    ) -> float:
        """
        计算质量得分（0-100）
        
        评分规则：
        1. 覆盖率占40%：覆盖率越高，得分越高
        2. 问题密度占30%：问题越少，得分越高
        3. 安全问题占20%：安全问题越少，得分越高
        4. 改进建议占10%：有改进建议说明代码有提升空间
        """
        # 覆盖率得分（0-40）
        coverage_score = (coverage / 100) * 40
        
        # 问题密度得分（0-30）
        # 问题密度越低越好，当问题密度>=10时得分为0
        if issue_density >= 10:
            issue_score = 0
        else:
            issue_score = (1 - issue_density / 10) * 30
        
        # 安全问题得分（0-20）
        # 没有安全问题得满分，每个安全问题扣5分
        security_score = max(0, 20 - security_count * 5)
        
        # 改进建议得分（0-10）
        # 有适量的改进建议是好的，但太多说明代码质量差
        if suggestion_count == 0:
            suggestion_score = 5  # 没有建议得一半分
        elif suggestion_count <= 5:
            suggestion_score = 10  # 适量建议得满分
        else:
            suggestion_score = max(0, 10 - (suggestion_count - 5) * 0.5)
        
        total_score = coverage_score + issue_score + security_score + suggestion_score
        
        return min(100, max(0, total_score))
    
    @staticmethod
    def _get_quality_grade(score: float) -> str:
        """根据得分获取质量等级"""
        if score >= 90:
            return 'A+'
        elif score >= 80:
            return 'A'
        elif score >= 70:
            return 'B+'
        elif score >= 60:
            return 'B'
        elif score >= 50:
            return 'C'
        else:
            return 'D'


quality_service = QualityService()
