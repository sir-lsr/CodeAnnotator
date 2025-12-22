/**
 * 质量评估服务
 */
import api from './api'
import type { FileQualityMetrics, ProjectQualityMetrics, QualitySummary } from '../types'

/**
 * 获取文件质量评估
 */
export const getFileQuality = async (fileId: number): Promise<FileQualityMetrics> => {
  // 注意：api 响应拦截器已经返回了 response.data，所以这里直接返回即可
  return await api.get(`/quality/file/${fileId}`)
}

/**
 * 获取项目质量评估
 */
export const getProjectQuality = async (projectId: number): Promise<ProjectQualityMetrics> => {
  // 注意：api 响应拦截器已经返回了 response.data，所以这里直接返回即可
  return await api.get(`/quality/project/${projectId}`)
}

/**
 * 获取质量摘要
 */
export const getQualitySummary = async (): Promise<QualitySummary> => {
  // 注意：api 响应拦截器已经返回了 response.data，所以这里直接返回即可
  return await api.get('/quality/summary')
}

export default {
  getFileQuality,
  getProjectQuality,
  getQualitySummary
}
