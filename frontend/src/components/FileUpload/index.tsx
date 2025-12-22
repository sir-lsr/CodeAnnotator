import { useState } from 'react'
import { Upload, Button, message, Input, Tabs, Form } from 'antd'
import { UploadOutlined, GithubOutlined } from '@ant-design/icons'
import { fileService } from '../../services/fileService'
import type { UploadProps } from 'antd'

interface FileUploadProps {
  projectId: number
  onSuccess?: () => void
}

export default function FileUpload({ projectId, onSuccess }: FileUploadProps) {
  const [loading, setLoading] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: async (file) => {
      try {
        setLoading(true)
        await fileService.uploadFile(file, projectId)
        message.success(`${file.name} 上传成功`)
        onSuccess?.()
      } catch (error: any) {
        message.error(`上传失败: ${error.message}`)
      } finally {
        setLoading(false)
      }
      return false // 阻止默认上传行为
    },
    showUploadList: false,
  }

  const handleGitImport = async () => {
    if (!repoUrl.trim()) {
      message.warning('请输入Git仓库URL')
      return
    }

    try {
      setLoading(true)
      const result = await fileService.gitImport(repoUrl, projectId)
      message.success(result.message || '导入成功')
      setRepoUrl('')
      onSuccess?.()
    } catch (error: any) {
      message.error(`导入失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const items = [
    {
      key: '1',
      label: '文件上传',
      children: (
        <div style={{ padding: '20px 0' }}>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />} loading={loading}>
              选择文件上传
            </Button>
          </Upload>
          <p style={{ marginTop: 16, color: '#666' }}>
            支持的文件类型: .py, .js, .ts, .java, .cpp, .go 等
          </p>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Git导入',
      children: (
        <div style={{ padding: '20px 0' }}>
          <Form layout="vertical">
            <Form.Item label="Git仓库URL">
              <Input
                prefix={<GithubOutlined />}
                placeholder="https://github.com/username/repo.git"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onPressEnter={handleGitImport}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<GithubOutlined />}
                onClick={handleGitImport}
                loading={loading}
              >
                导入仓库
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ]

  return <Tabs items={items} />
}

