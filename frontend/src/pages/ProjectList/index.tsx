import { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Spin,
  Empty,
  Space,
  Popconfirm,
  Tag,
} from 'antd'
import {
  PlusOutlined,
  FolderOutlined,
  FileTextOutlined,
  DeleteOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { projectService } from '../../services/projectService'
import type { Project } from '../../types'

export default function ProjectList() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await projectService.getProjects()
      setProjects(data)
    } catch (error: any) {
      message.error(`加载失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (values: any) => {
    try {
      await projectService.createProject(values)
      message.success('项目创建成功')
      setModalVisible(false)
      form.resetFields()
      loadProjects()
    } catch (error: any) {
      message.error(`创建失败: ${error.message}`)
    }
  }

  const handleArchiveProject = async (id: number) => {
    try {
      await projectService.archiveProject(id)
      message.success('项目已归档')
      loadProjects()
    } catch (error: any) {
      message.error(`归档失败: ${error.message}`)
    }
  }

  const handleDeleteProject = async (id: number) => {
    try {
      await projectService.deleteProject(id)
      message.success('项目已删除')
      loadProjects()
    } catch (error: any) {
      message.error(`删除失败: ${error.message}`)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <h2>项目列表</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          新建项目
        </Button>
      </div>

      <Spin spinning={loading}>
        {projects.length === 0 ? (
          <Empty description="暂无项目，点击新建项目开始" />
        ) : (
          <Row gutter={[16, 16]}>
            {projects.map((project) => (
              <Col key={project.id} xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  onClick={() => navigate(`/annotation/${project.id}`)}
                  actions={[
                    <Popconfirm
                      title="确定要归档这个项目吗？"
                      onConfirm={(e) => {
                        e?.stopPropagation()
                        handleArchiveProject(project.id)
                      }}
                      onCancel={(e) => e?.stopPropagation()}
                    >
                      <InboxOutlined
                        key="archive"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>,
                    <Popconfirm
                      title="确定要删除这个项目吗？"
                      onConfirm={(e) => {
                        e?.stopPropagation()
                        handleDeleteProject(project.id)
                      }}
                      onCancel={(e) => e?.stopPropagation()}
                    >
                      <DeleteOutlined
                        key="delete"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    avatar={<FolderOutlined style={{ fontSize: 32 }} />}
                    title={
                      <Space>
                        {project.name}
                        {project.status === 'archived' && (
                          <Tag color="default">已归档</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        <p>{project.description || '暂无描述'}</p>
                        <Space style={{ marginTop: 8 }}>
                          {project.language && <Tag>{project.language}</Tag>}
                          <span>
                            <FileTextOutlined /> {project.file_count || 0} 个文件
                          </span>
                        </Space>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      <Modal
        title="新建项目"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateProject}>
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item name="description" label="项目描述">
            <Input.TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>

          <Form.Item name="language" label="编程语言">
            <Select placeholder="请选择编程语言">
              <Select.Option value="python">Python</Select.Option>
              <Select.Option value="javascript">JavaScript</Select.Option>
              <Select.Option value="typescript">TypeScript</Select.Option>
              <Select.Option value="java">Java</Select.Option>
              <Select.Option value="cpp">C++</Select.Option>
              <Select.Option value="go">Go</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}











