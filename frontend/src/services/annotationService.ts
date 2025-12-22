/**
 * 标注服务
 */
import api from './api'
import { Annotation, LLMGenerateRequest } from '../types'

export const annotationService = {
  // 生成标注
  generateAnnotations: async (data: LLMGenerateRequest): Promise<any> => {
    return api.post('/annotations/generate', data)
  },

  // 创建标注
  createAnnotation: async (data: Partial<Annotation>): Promise<Annotation> => {
    return api.post('/annotations/', data)
  },

  // 获取标注列表
  getAnnotations: async (params?: {
    file_id?: number
    annotation_type?: string
    status?: string
  }): Promise<Annotation[]> => {
    return api.get('/annotations/', { params })
  },

  // 更新标注
  updateAnnotation: async (id: number, data: Partial<Annotation>): Promise<Annotation> => {
    return api.put(`/annotations/${id}`, data)
  },

  // 审核通过
  approveAnnotation: async (id: number): Promise<void> => {
    return api.post(`/annotations/${id}/approve`)
  },

  // 审核拒绝
  rejectAnnotation: async (id: number): Promise<void> => {
    return api.post(`/annotations/${id}/reject`)
  },

  // 删除标注
  deleteAnnotation: async (id: number): Promise<void> => {
    return api.delete(`/annotations/${id}`)
  },
}








