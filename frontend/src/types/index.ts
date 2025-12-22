/**
 * 类型定义
 */

// 项目
export interface Project {
  id: number
  name: string
  description?: string
  language?: string
  status: 'active' | 'archived'
  settings?: Record<string, any>
  created_at: string
  updated_at?: string
  file_count?: number
}

export interface ProjectCreate {
  name: string
  description?: string
  language?: string
  settings?: Record<string, any>
}

// 文件
export interface File {
  id: number
  project_id: number
  filename: string
  filepath?: string
  content: string
  language?: string
  size?: number
  created_at: string
  annotation_count?: number
}

// 标注
export interface Annotation {
  id: number
  file_id: number
  type: 'line' | 'function'
  line_number?: number
  line_end?: number
  function_name?: string
  content: string
  annotation_type: 'info' | 'warning' | 'suggestion' | 'security'
  status: 'pending' | 'approved' | 'rejected'
  color?: string
  created_at: string
  updated_at?: string
}

// LLM生成请求
export interface LLMGenerateRequest {
  file_id: number
  generate_line_annotations: boolean
  generate_function_annotations: boolean
}

// API响应
export interface ApiResponse<T = any> {
  success?: boolean
  message?: string
  data?: T
}

// 质量评估
export interface FileQualityMetrics {
  file_id: number
  filename: string
  filepath?: string
  total_lines: number
  annotated_lines: number
  coverage: number  // 覆盖率（0-100）
  total_annotations: number
  info_count: number
  warning_count: number
  suggestion_count: number
  security_count: number
  issue_density: number  // 问题密度（问题数/百行代码）
  quality_score: number  // 质量得分（0-100）
  quality_grade: string  // 质量等级（A+, A, B, C, D）
}

export interface ProjectQualityMetrics {
  project_id: number
  project_name: string
  total_files: number
  total_lines: number
  annotated_lines: number
  coverage: number
  total_annotations: number
  info_count: number
  warning_count: number
  suggestion_count: number
  security_count: number
  pending_count: number
  approved_count: number
  rejected_count: number
  issue_density: number
  quality_score: number
  quality_grade: string
  file_metrics: FileQualityMetrics[]
}

export interface QualitySummary {
  total_projects: number
  total_files: number
  total_annotations: number
  average_quality_score: number
  high_quality_files: number
  medium_quality_files: number
  low_quality_files: number
}









