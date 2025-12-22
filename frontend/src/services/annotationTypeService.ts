/**
 * 标注类型服务
 */
import api from './api'

export interface AnnotationType {
  id: number
  name: string
  color: string
  icon?: string
  priority: number
  created_at: string
  updated_at?: string
}

export interface AnnotationTypeCreate {
  name: string
  color: string
  icon?: string
  priority: number
}

export interface AnnotationTypeUpdate {
  name?: string
  color?: string
  icon?: string
  priority?: number
}

/**
 * 获取所有标注类型
 */
export const getAnnotationTypes = async (): Promise<AnnotationType[]> => {
  return await api.get('/annotation-types/')
}

/**
 * 获取单个标注类型
 */
export const getAnnotationType = async (id: number): Promise<AnnotationType> => {
  return await api.get(`/annotation-types/${id}`)
}

/**
 * 创建标注类型
 */
export const createAnnotationType = async (data: AnnotationTypeCreate): Promise<AnnotationType> => {
  return await api.post('/annotation-types/', data)
}

/**
 * 更新标注类型
 */
export const updateAnnotationType = async (
  id: number,
  data: AnnotationTypeUpdate
): Promise<AnnotationType> => {
  return await api.put(`/annotation-types/${id}`, data)
}

/**
 * 删除标注类型
 */
export const deleteAnnotationType = async (id: number): Promise<void> => {
  return await api.delete(`/annotation-types/${id}`)
}

/**
 * 初始化默认标注类型
 */
export const initDefaultAnnotationTypes = async (): Promise<{ message: string; created_count: number }> => {
  return await api.post('/annotation-types/init-defaults')
}

export const annotationTypeService = {
  getAnnotationTypes,
  getAnnotationType,
  createAnnotationType,
  updateAnnotationType,
  deleteAnnotationType,
  initDefaultAnnotationTypes,
}
