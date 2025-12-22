/**
 * 项目服务
 */
import api from './api'
import { Project, ProjectCreate } from '../types'

export const projectService = {
  // 创建项目
  createProject: async (data: ProjectCreate): Promise<Project> => {
    return api.post('/projects/', data)
  },

  // 获取项目列表
  getProjects: async (status?: string): Promise<Project[]> => {
    return api.get('/projects/', { params: { status } })
  },

  // 获取项目详情
  getProject: async (id: number): Promise<Project> => {
    return api.get(`/projects/${id}`)
  },

  // 更新项目
  updateProject: async (id: number, data: Partial<Project>): Promise<Project> => {
    return api.put(`/projects/${id}`, data)
  },

  // 归档项目
  archiveProject: async (id: number): Promise<void> => {
    return api.post(`/projects/${id}/archive`)
  },

  // 删除项目
  deleteProject: async (id: number): Promise<void> => {
    return api.delete(`/projects/${id}`)
  },
}











