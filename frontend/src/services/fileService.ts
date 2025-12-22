/**
 * 文件服务
 */
import api from './api'
import { File } from '../types'

export const fileService = {
  // 上传文件
  uploadFile: async (file: globalThis.File, projectId: number): Promise<File> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('project_id', projectId.toString())

    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Git导入
  gitImport: async (repoUrl: string, projectId: number): Promise<any> => {
    const formData = new FormData()
    formData.append('repo_url', repoUrl)
    formData.append('project_id', projectId.toString())

    return api.post('/files/git-import', formData)
  },

  // 获取文件详情
  getFile: async (id: number): Promise<File> => {
    return api.get(`/files/${id}`)
  },

  // 获取项目文件列表
  getProjectFiles: async (projectId: number): Promise<File[]> => {
    return api.get(`/files/project/${projectId}/list`)
  },

  // 删除文件
  deleteFile: async (id: number): Promise<void> => {
    return api.delete(`/files/${id}`)
  },
}


