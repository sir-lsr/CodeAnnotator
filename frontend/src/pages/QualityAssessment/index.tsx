/**
 * 质量评估页面
 */
import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Progress, Spin, Alert, Select, Typography, Space, Button, message } from 'antd'
import { 
  CheckCircleOutlined, 
  WarningOutlined, 
  BugOutlined, 
  FileTextOutlined,
  TrophyOutlined,
  BarChartOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { getQualitySummary, getProjectQuality } from '../../services/qualityService'
import { projectService } from '../../services/projectService'
import type { QualitySummary, ProjectQualityMetrics, Project, FileQualityMetrics } from '../../types'
import QualityCharts from '../../components/QualityCharts'
import './style.css'

const { Title, Text } = Typography
const { Option } = Select

const QualityAssessment: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<QualitySummary | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [projectQuality, setProjectQuality] = useState<ProjectQualityMetrics | null>(null)

  // 加载质量摘要
  const loadSummary = async () => {
    try {
      setLoading(true)
      const data = await getQualitySummary()
      setSummary(data)
    } catch (error) {
      console.error('加载质量摘要失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载项目列表
  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects()
      setProjects(data)
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id)
      } else if (data.length === 0) {
        message.warning('请先创建项目并上传文件')
      }
    } catch (error) {
      console.error('加载项目列表失败:', error)
      message.error('加载项目列表失败')
    }
  }

  // 加载项目质量评估
  const loadProjectQuality = async (projectId: number) => {
    try {
      setLoading(true)
      const data = await getProjectQuality(projectId)
      setProjectQuality(data)
    } catch (error: any) {
      console.error('加载项目质量评估失败:', error)
      message.error(`加载项目质量评估失败: ${error.message || '未知错误'}`)
      setProjectQuality(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSummary()
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectQuality(selectedProjectId)
    }
  }, [selectedProjectId])

  // 刷新数据
  const handleRefresh = () => {
    loadSummary()
    if (selectedProjectId) {
      loadProjectQuality(selectedProjectId)
    }
  }

  // 获取质量等级颜色
  const getGradeColor = (grade: string): string => {
    const colorMap: Record<string, string> = {
      'A+': '#52c41a',
      'A': '#73d13d',
      'B+': '#95de64',
      'B': '#faad14',
      'C': '#ff7a45',
      'D': '#f5222d'
    }
    return colorMap[grade] || '#d9d9d9'
  }

  // 获取质量得分状态
  const getScoreStatus = (score: number): 'success' | 'normal' | 'exception' => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'normal'
    return 'exception'
  }

  // 文件质量表格列
  const fileColumns = [
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
      width: 200,
      ellipsis: true,
      render: (text: string, record: FileQualityMetrics) => (
        <div>
          <div><FileTextOutlined /> {text}</div>
          {record.filepath && <Text type="secondary" style={{ fontSize: '12px' }}>{record.filepath}</Text>}
        </div>
      )
    },
    {
      title: '代码行数',
      dataIndex: 'total_lines',
      key: 'total_lines',
      width: 100,
      align: 'center' as const
    },
    {
      title: '标注覆盖率',
      dataIndex: 'coverage',
      key: 'coverage',
      width: 150,
      align: 'center' as const,
      render: (coverage: number) => (
        <Progress 
          percent={coverage} 
          size="small" 
          status={coverage >= 80 ? 'success' : coverage >= 50 ? 'normal' : 'exception'}
        />
      )
    },
    {
      title: '标注统计',
      key: 'annotations',
      width: 200,
      render: (_: any, record: FileQualityMetrics) => (
        <Space size={4}>
          <Tag color="blue" icon={<CheckCircleOutlined />}>{record.info_count}</Tag>
          <Tag color="orange" icon={<WarningOutlined />}>{record.warning_count}</Tag>
          <Tag color="green">{record.suggestion_count}</Tag>
          <Tag color="red" icon={<BugOutlined />}>{record.security_count}</Tag>
        </Space>
      )
    },
    {
      title: '问题密度',
      dataIndex: 'issue_density',
      key: 'issue_density',
      width: 100,
      align: 'center' as const,
      render: (density: number) => (
        <Tag color={density < 2 ? 'success' : density < 5 ? 'warning' : 'error'}>
          {density.toFixed(2)}
        </Tag>
      )
    },
    {
      title: '质量得分',
      dataIndex: 'quality_score',
      key: 'quality_score',
      width: 120,
      align: 'center' as const,
      render: (score: number) => (
        <Progress 
          type="circle" 
          percent={score} 
          width={50}
          status={getScoreStatus(score)}
          format={(percent) => `${percent?.toFixed(0)}`}
        />
      )
    },
    {
      title: '质量等级',
      dataIndex: 'quality_grade',
      key: 'quality_grade',
      width: 100,
      align: 'center' as const,
      render: (grade: string) => (
        <Tag color={getGradeColor(grade)} style={{ fontSize: '14px', fontWeight: 'bold' }}>
          {grade}
        </Tag>
      )
    }
  ]

  return (
    <div className="quality-assessment-container">
      <div className="quality-header">
        <Title level={2}>
          <BarChartOutlined /> 质量评估
        </Title>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
          刷新
        </Button>
      </div>

      {/* 质量摘要 */}
      {summary && (
        <Card title="整体质量概览" className="summary-card">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="总项目数"
                value={summary.total_projects}
                prefix={<FileTextOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="总文件数"
                value={summary.total_files}
                prefix={<FileTextOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="总标注数"
                value={summary.total_annotations}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="平均质量得分"
                value={summary.average_quality_score}
                precision={1}
                prefix={<TrophyOutlined />}
                suffix="/ 100"
                valueStyle={{ color: summary.average_quality_score >= 80 ? '#52c41a' : summary.average_quality_score >= 60 ? '#faad14' : '#f5222d' }}
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={8}>
              <Card size="small" className="quality-distribution-card">
                <Statistic
                  title="高质量文件 (≥80分)"
                  value={summary.high_quality_files}
                  valueStyle={{ color: '#52c41a' }}
                  suffix={`/ ${summary.total_files}`}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" className="quality-distribution-card">
                <Statistic
                  title="中等质量文件 (60-80分)"
                  value={summary.medium_quality_files}
                  valueStyle={{ color: '#faad14' }}
                  suffix={`/ ${summary.total_files}`}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" className="quality-distribution-card">
                <Statistic
                  title="低质量文件 (<60分)"
                  value={summary.low_quality_files}
                  valueStyle={{ color: '#f5222d' }}
                  suffix={`/ ${summary.total_files}`}
                />
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 项目质量详情 */}
      <Card 
        title={
          <Space>
            <span>项目质量详情</span>
            <Select
              style={{ width: 300 }}
              placeholder="选择项目"
              value={selectedProjectId}
              onChange={setSelectedProjectId}
            >
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Space>
        }
        className="project-quality-card"
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        ) : projectQuality ? (
          <>
            {/* 项目质量指标 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={4}>
                <Card size="small" className="metric-card">
                  <Statistic
                    title="总文件数"
                    value={projectQuality.total_files}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card size="small" className="metric-card">
                  <Statistic
                    title="总代码行数"
                    value={projectQuality.total_lines}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card size="small" className="metric-card">
                  <Statistic
                    title="标注覆盖率"
                    value={projectQuality.coverage}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: projectQuality.coverage >= 80 ? '#52c41a' : projectQuality.coverage >= 50 ? '#faad14' : '#f5222d' }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card size="small" className="metric-card">
                  <Statistic
                    title="问题密度"
                    value={projectQuality.issue_density}
                    precision={2}
                    valueStyle={{ color: projectQuality.issue_density < 2 ? '#52c41a' : projectQuality.issue_density < 5 ? '#faad14' : '#f5222d' }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card size="small" className="metric-card">
                  <Statistic
                    title="质量得分"
                    value={projectQuality.quality_score}
                    precision={1}
                    suffix="/ 100"
                    valueStyle={{ color: projectQuality.quality_score >= 80 ? '#52c41a' : projectQuality.quality_score >= 60 ? '#faad14' : '#f5222d' }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card size="small" className="metric-card">
                  <div style={{ textAlign: 'center' }}>
                    <div className="ant-statistic-title">质量等级</div>
                    <div className="ant-statistic-content">
                      <Tag 
                        color={getGradeColor(projectQuality.quality_grade)} 
                        style={{ fontSize: '24px', fontWeight: 'bold', padding: '4px 16px' }}
                      >
                        {projectQuality.quality_grade}
                      </Tag>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* 标注类型统计 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Card size="small" title="标注类型统计">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div className="annotation-stat-item">
                      <Text>信息标注:</Text>
                      <Tag color="blue" icon={<CheckCircleOutlined />}>{projectQuality.info_count}</Tag>
                    </div>
                    <div className="annotation-stat-item">
                      <Text>警告标注:</Text>
                      <Tag color="orange" icon={<WarningOutlined />}>{projectQuality.warning_count}</Tag>
                    </div>
                    <div className="annotation-stat-item">
                      <Text>建议标注:</Text>
                      <Tag color="green">{projectQuality.suggestion_count}</Tag>
                    </div>
                    <div className="annotation-stat-item">
                      <Text>安全问题:</Text>
                      <Tag color="red" icon={<BugOutlined />}>{projectQuality.security_count}</Tag>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="审核状态统计">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div className="annotation-stat-item">
                      <Text>待审核:</Text>
                      <Tag color="default">{projectQuality.pending_count}</Tag>
                    </div>
                    <div className="annotation-stat-item">
                      <Text>已通过:</Text>
                      <Tag color="success">{projectQuality.approved_count}</Tag>
                    </div>
                    <div className="annotation-stat-item">
                      <Text>已拒绝:</Text>
                      <Tag color="error">{projectQuality.rejected_count}</Tag>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* 数据可视化图表 */}
            <QualityCharts projectQuality={projectQuality} />

            {/* 质量评估说明 */}
            <Alert
              message="质量评估说明"
              description={
                <div>
                  <p><strong>质量得分计算规则：</strong></p>
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>标注覆盖率占40%：覆盖率越高，得分越高</li>
                    <li>问题密度占30%：问题越少，得分越高</li>
                    <li>安全问题占20%：安全问题越少，得分越高</li>
                    <li>改进建议占10%：适量的改进建议表明代码有提升空间</li>
                  </ul>
                  <p style={{ marginTop: 8, marginBottom: 0 }}><strong>质量等级：</strong>A+ (≥90) / A (≥80) / B+ (≥70) / B (≥60) / C (≥50) / D (&lt;50)</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            {/* 文件质量详情表格 */}
            <Table
              columns={fileColumns}
              dataSource={projectQuality.file_metrics}
              rowKey="file_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 个文件`
              }}
              scroll={{ x: 1200 }}
            />
          </>
        ) : (
          <Alert message="请选择项目查看质量评估" type="info" showIcon />
        )}
      </Card>
    </div>
  )
}

export default QualityAssessment
