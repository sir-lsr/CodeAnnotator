import { useState, useEffect } from 'react'
import {
  Table,
  Tag,
  Button,
  Space,
  message,
  Select,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Descriptions,
  Badge,
} from 'antd'
import { 
  CheckOutlined, 
  CloseOutlined, 
  EyeOutlined,
  FileTextOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { annotationService } from '../../services/annotationService'
import type { Annotation } from '../../types'

export default function AnnotationReview() {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>()

  useEffect(() => {
    loadAnnotations()
  }, [statusFilter])

  const loadAnnotations = async () => {
    try {
      setLoading(true)
      const data = await annotationService.getAnnotations({
        status: statusFilter,
      })
      setAnnotations(data)
    } catch (error: any) {
      message.error(`加载失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await annotationService.approveAnnotation(id)
      message.success('审核通过')
      loadAnnotations()
    } catch (error: any) {
      message.error(`操作失败: ${error.message}`)
    }
  }

  const handleReject = async (id: number) => {
    try {
      await annotationService.rejectAnnotation(id)
      message.success('已拒绝')
      loadAnnotations()
    } catch (error: any) {
      message.error(`操作失败: ${error.message}`)
    }
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'gold', text: '待审核' },
      approved: { color: 'green', text: '已通过' },
      rejected: { color: 'red', text: '已拒绝' },
    }
    const config = statusMap[status] || statusMap.pending
    return <Tag color={config.color}>{config.text}</Tag>
  }

  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string }> = {
      info: { color: 'blue' },
      warning: { color: 'orange' },
      suggestion: { color: 'green' },
      security: { color: 'red' },
    }
    const config = typeMap[type] || typeMap.info
    return <Tag color={config.color}>{type}</Tag>
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => type === 'line' ? '行内' : '函数',
    },
    {
      title: '标注类型',
      dataIndex: 'annotation_type',
      key: 'annotation_type',
      width: 120,
      render: (type: string) => getTypeTag(type),
    },
    {
      title: '位置',
      key: 'location',
      width: 150,
      render: (_: any, record: Annotation) =>
        record.type === 'line'
          ? `行 ${record.line_number}`
          : record.function_name,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Annotation) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="确定通过这条标注吗？"
                onConfirm={() => handleApprove(record.id)}
              >
                <Button type="link" size="small" icon={<CheckOutlined />}>
                  通过
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确定拒绝这条标注吗？"
                onConfirm={() => handleReject(record.id)}
              >
                <Button
                  type="link"
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                >
                  拒绝
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>标注审核</h2>
        <Select
          style={{ width: 200 }}
          placeholder="筛选状态"
          allowClear
          onChange={setStatusFilter}
          options={[
            { label: '待审核', value: 'pending' },
            { label: '已通过', value: 'approved' },
            { label: '已拒绝', value: 'rejected' },
          ]}
        />
      </div>

      <Table
        columns={columns}
        dataSource={annotations}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  )
}










