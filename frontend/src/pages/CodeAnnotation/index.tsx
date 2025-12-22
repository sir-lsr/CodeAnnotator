import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Tree,
  Button,
  message,
  Modal,
  Spin,
  Empty,
  List,
  Tag,
  Space,
  Tooltip,
  Drawer,
  Input,
  Select,
  Form,
  Popconfirm,
  Badge,
} from 'antd'
import {
  FileTextOutlined,
  ThunderboltOutlined,
  UploadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  BulbOutlined,
  SafetyOutlined,
  EyeOutlined,
  CopyOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import Editor, { Monaco } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { fileService } from '../../services/fileService'
import { annotationService } from '../../services/annotationService'
import FileUpload from '../../components/FileUpload'
import type { File, Annotation } from '../../types'

const { Sider, Content } = Layout

export default function CodeAnnotation() {
  const { projectId } = useParams<{ projectId: string }>()
  const [files, setFiles] = useState<File[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [annotationDrawerVisible, setAnnotationDrawerVisible] = useState(false)
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null)
  const [annotatedCodeModalVisible, setAnnotatedCodeModalVisible] = useState(false)
  const [annotatedCode, setAnnotatedCode] = useState<string>('')
  const [form] = Form.useForm()
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const decorationsRef = useRef<string[]>([])
  
  // 标注类型图标映射
  const annotationIcons: Record<string, any> = {
    info: InfoCircleOutlined,
    warning: WarningOutlined,
    suggestion: BulbOutlined,
    security: SafetyOutlined,
  }

  useEffect(() => {
    if (projectId) {
      loadFiles()
    }
  }, [projectId])

  useEffect(() => {
    if (selectedFile) {
      loadAnnotations()
    }
  }, [selectedFile])

  // 当标注更新时，更新编辑器装饰器
  useEffect(() => {
    if (editorRef.current && annotations.length > 0) {
      updateEditorDecorations()
    }
  }, [annotations])

  // 更新编辑器装饰器
  const updateEditorDecorations = () => {
    if (!editorRef.current) return

    const editor = editorRef.current
    const newDecorations: monaco.editor.IModelDeltaDecoration[] = []

    // 为每个行内标注添加装饰
    annotations
      .filter((ann) => ann.type === 'line')
      .forEach((annotation) => {
        const lineNumber = annotation.line_number || 0
        
        // 行高亮装饰
        newDecorations.push({
          range: new monaco.Range(lineNumber, 1, lineNumber, 1),
          options: {
            isWholeLine: true,
            className: `annotation-line annotation-${annotation.annotation_type}`,
            glyphMarginClassName: `annotation-glyph annotation-glyph-${annotation.annotation_type}`,
            hoverMessage: {
              value: `**${annotation.annotation_type.toUpperCase()}**: ${annotation.content}`,
            },
            glyphMarginHoverMessage: {
              value: `点击查看详情`,
            },
          },
        })

        // 行号旁边的标记
        newDecorations.push({
          range: new monaco.Range(lineNumber, 1, lineNumber, 1),
          options: {
            glyphMarginClassName: `annotation-glyph-${annotation.annotation_type}`,
          },
        })
      })

    // 应用装饰
    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations
    )
  }

  // 处理编辑器挂载
  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor

    // 添加自定义CSS样式
    const style = document.createElement('style')
    style.innerHTML = `
      .annotation-line { background-color: rgba(24, 144, 255, 0.1); }
      .annotation-line.annotation-info { background-color: rgba(24, 144, 255, 0.1); }
      .annotation-line.annotation-warning { background-color: rgba(250, 173, 20, 0.1); }
      .annotation-line.annotation-suggestion { background-color: rgba(82, 196, 26, 0.1); }
      .annotation-line.annotation-security { background-color: rgba(245, 34, 45, 0.1); }
      
      .annotation-glyph-info::before { content: "[i]"; color: #1890ff; font-weight: bold; }
      .annotation-glyph-warning::before { content: "[!]"; color: #faad14; font-weight: bold; }
      .annotation-glyph-suggestion::before { content: "[*]"; color: #52c41a; font-weight: bold; }
      .annotation-glyph-security::before { content: "[#]"; color: #f5222d; font-weight: bold; }
    `
    document.head.appendChild(style)

    // 添加点击行号事件
    editor.onMouseDown((e) => {
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) {
        const lineNumber = e.target.position?.lineNumber
        if (lineNumber) {
          handleLineClick(lineNumber)
        }
      }
    })

    // 应用装饰
    if (annotations.length > 0) {
      updateEditorDecorations()
    }
  }

  // 处理行号点击
  const handleLineClick = (lineNumber: number) => {
    const existingAnnotation = annotations.find(
      (ann) => ann.type === 'line' && ann.line_number === lineNumber
    )

    if (existingAnnotation) {
      setEditingAnnotation(existingAnnotation)
      form.setFieldsValue({
        content: existingAnnotation.content,
        annotation_type: existingAnnotation.annotation_type,
      })
    } else {
      setEditingAnnotation(null)
      form.resetFields()
    }

    setSelectedLine(lineNumber)
    setAnnotationDrawerVisible(true)
  }

  const loadFiles = async () => {
    try {
      setLoading(true)
      const data = await fileService.getProjectFiles(Number(projectId))
      setFiles(data)
    } catch (error: any) {
      message.error(`加载文件失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadAnnotations = async () => {
    if (!selectedFile) return

    try {
      const data = await annotationService.getAnnotations({
        file_id: selectedFile.id,
      })
      setAnnotations(data)
    } catch (error: any) {
      message.error(`加载标注失败: ${error.message}`)
    }
  }

  const handleGenerateAnnotations = async () => {
    if (!selectedFile) {
      message.warning('请先选择文件')
      return
    }

    try {
      setGenerating(true)
      await annotationService.generateAnnotations({
        file_id: selectedFile.id,
        generate_line_annotations: true,
        generate_function_annotations: true,
      })
      message.success('标注生成成功')
      loadAnnotations()
    } catch (error: any) {
      message.error(`生成失败: ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  // 保存标注
  const handleSaveAnnotation = async (values: any) => {
    if (!selectedFile || selectedLine === null) return

    try {
      if (editingAnnotation) {
        // 更新现有标注
        await annotationService.updateAnnotation(editingAnnotation.id, {
          content: values.content,
          annotation_type: values.annotation_type,
        })
        message.success('标注已更新')
      } else {
        // 创建新标注
        await annotationService.createAnnotation({
          file_id: selectedFile.id,
          type: 'line',
          line_number: selectedLine,
          content: values.content,
          annotation_type: values.annotation_type,
          color: getAnnotationColor(values.annotation_type),
        })
        message.success('标注已添加')
      }

      setAnnotationDrawerVisible(false)
      form.resetFields()
      loadAnnotations()
    } catch (error: any) {
      message.error(`保存失败: ${error.message}`)
    }
  }

  // 删除标注
  const handleDeleteAnnotation = async (annotationId: number) => {
    try {
      await annotationService.deleteAnnotation(annotationId)
      message.success('标注已删除')
      setAnnotationDrawerVisible(false)
      loadAnnotations()
    } catch (error: any) {
      message.error(`删除失败: ${error.message}`)
    }
  }

  // 跳转到指定行
  const jumpToLine = (lineNumber: number) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(lineNumber)
      editorRef.current.setPosition({ lineNumber, column: 1 })
      editorRef.current.focus()
    }
  }

  // 生成带注释的代码
  const generateAnnotatedCode = () => {
    if (!selectedFile) {
      message.warning('请先选择文件')
      return
    }

    const lines = selectedFile.content.split('\n')
    const lineAnnotations = annotations
      .filter((ann) => ann.type === 'line')
      .sort((a, b) => (a.line_number || 0) - (b.line_number || 0))

    const functionAnnotations = annotations
      .filter((ann) => ann.type === 'function')
      .sort((a, b) => (a.line_number || 0) - (b.line_number || 0))

    // 获取注释符号
    const commentSymbol = getCommentSymbol(selectedFile.language || 'python')
    
    let result: string[] = []
    let processedLines = new Set<number>()

    // 添加文件头注释
    result.push(`${commentSymbol} 代码标注文件`)
    result.push(`${commentSymbol} 原文件: ${selectedFile.filename}`)
    result.push(`${commentSymbol} 生成时间: ${new Date().toLocaleString('zh-CN')}`)
    result.push(`${commentSymbol} 标注数量: ${annotations.length}`)
    result.push('')

    for (let i = 0; i < lines.length; i++) {
      const lineNumber = i + 1
      const line = lines[i]

      // 检查是否有函数标注
      const funcAnnotation = functionAnnotations.find(
        (ann) => ann.line_number === lineNumber
      )

      if (funcAnnotation && !processedLines.has(lineNumber)) {
        // 添加函数文档注释
        result.push('')
        if (selectedFile.language === 'python') {
          result.push(`"""`)
          result.push(`${funcAnnotation.content}`)
          result.push(`"""`)
        } else if (selectedFile.language === 'javascript' || selectedFile.language === 'typescript') {
          result.push(`/**`)
          funcAnnotation.content.split('\n').forEach(line => {
            result.push(` * ${line}`)
          })
          result.push(` */`)
        } else {
          funcAnnotation.content.split('\n').forEach(line => {
            result.push(`${commentSymbol} ${line}`)
          })
        }
        processedLines.add(lineNumber)
      }

      // 检查是否有行内标注
      const lineAnnotation = lineAnnotations.find(
        (ann) => ann.line_number === lineNumber
      )

      if (lineAnnotation) {
        // 添加行内注释
        const annotationIcon = getAnnotationIcon(lineAnnotation.annotation_type)
        result.push(`${commentSymbol} ${annotationIcon} [${lineAnnotation.annotation_type.toUpperCase()}] ${lineAnnotation.content}`)
      }

      // 添加原始代码行
      result.push(line)
    }

    const generatedCode = result.join('\n')
    setAnnotatedCode(generatedCode)
    setAnnotatedCodeModalVisible(true)
  }

  // 获取注释符号
  const getCommentSymbol = (language: string): string => {
    const commentMap: Record<string, string> = {
      python: '#',
      javascript: '//',
      typescript: '//',
      java: '//',
      cpp: '//',
      c: '//',
      go: '//',
      rust: '//',
      php: '//',
      ruby: '#',
      shell: '#',
      sql: '--',
    }
    return commentMap[language] || '#'
  }

  // 获取标注图标
  const getAnnotationIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      info: '[INFO]',
      warning: '[WARN]',
      suggestion: '[SUGG]',
      security: '[SEC]',
    }
    return iconMap[type] || '[INFO]'
  }

  // 复制带注释的代码
  const copyAnnotatedCode = () => {
    navigator.clipboard.writeText(annotatedCode)
    message.success('代码已复制到剪贴板')
  }

  // 下载带注释的代码
  const downloadAnnotatedCode = () => {
    if (!selectedFile) return

    const blob = new Blob([annotatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `annotated_${selectedFile.filename}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    message.success('文件下载成功')
  }

  const getAnnotationColor = (type: string) => {
    const colors: Record<string, string> = {
      info: 'blue',
      warning: 'orange',
      suggestion: 'green',
      security: 'red',
    }
    return colors[type] || 'blue'
  }

  const treeData = files.map((file) => ({
    key: file.id,
    title: file.filename,
    icon: <FileTextOutlined />,
  }))

  return (
    <Layout style={{ background: '#fff', minHeight: 600 }}>
      <Sider width={250} style={{ background: '#fafafa', padding: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => setUploadModalVisible(true)}
            block
          >
            上传文件
          </Button>
        </div>

        <Spin spinning={loading}>
          {files.length === 0 ? (
            <Empty description="暂无文件" />
          ) : (
            <Tree
              showIcon
              treeData={treeData}
              onSelect={(keys) => {
                const fileId = keys[0] as number
                const file = files.find((f) => f.id === fileId)
                if (file) setSelectedFile(file)
              }}
            />
          )}
        </Spin>
      </Sider>

      <Content style={{ padding: '0 24px' }}>
        {selectedFile ? (
          <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{selectedFile.filename}</h3>
              <Space>
                <Button
                  icon={<EyeOutlined />}
                  onClick={generateAnnotatedCode}
                  disabled={annotations.length === 0}
                >
                  查看带注释代码
                </Button>
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  onClick={handleGenerateAnnotations}
                  loading={generating}
                >
                  生成标注
                </Button>
              </Space>
            </div>

            <Editor
              height="500px"
              defaultLanguage={selectedFile.language || 'python'}
              value={selectedFile.content}
              theme="vs-dark"
              onMount={handleEditorMount}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                lineNumbers: 'on',
                glyphMargin: true,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 4,
              }}
            />
          </>
        ) : (
          <Empty description="请选择文件" style={{ marginTop: 100 }} />
        )}
      </Content>

      <Sider width={350} style={{ background: '#fafafa', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h4>标注列表 ({annotations.length})</h4>
          <Badge count={annotations.filter((a) => a.status === 'pending').length} />
        </div>
        
        <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          <List
            dataSource={annotations}
            renderItem={(annotation) => {
              const Icon = annotationIcons[annotation.annotation_type] || InfoCircleOutlined
              return (
                <List.Item 
                  style={{ 
                    padding: '12px',
                    borderLeft: `3px solid ${annotation.color}`,
                    background: '#fff',
                    marginBottom: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  onClick={() => {
                    if (annotation.type === 'line' && annotation.line_number) {
                      jumpToLine(annotation.line_number)
                    }
                  }}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Space>
                        <Icon style={{ color: annotation.color }} />
                        <Tag color={getAnnotationColor(annotation.annotation_type)}>
                          {annotation.annotation_type}
                        </Tag>
                        {annotation.type === 'line' && (
                          <Tag color="default">行 {annotation.line_number}</Tag>
                        )}
                        {annotation.type === 'function' && (
                          <Tag color="cyan">{annotation.function_name}</Tag>
                        )}
                      </Space>
                      {annotation.type === 'line' && (
                        <Space>
                          <Tooltip title="编辑">
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleLineClick(annotation.line_number || 0)
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="删除">
                            <Popconfirm
                              title="确定删除此标注？"
                              onConfirm={(e) => {
                                e?.stopPropagation()
                                handleDeleteAnnotation(annotation.id)
                              }}
                              onCancel={(e) => e?.stopPropagation()}
                            >
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Popconfirm>
                          </Tooltip>
                        </Space>
                      )}
                    </div>
                    <p style={{ 
                      margin: 0, 
                      fontSize: 13,
                      color: '#666',
                      lineHeight: '1.5',
                    }}>
                      {annotation.content.length > 100 
                        ? `${annotation.content.substring(0, 100)}...` 
                        : annotation.content}
                    </p>
                  </div>
                </List.Item>
              )
            }}
          />
        </div>
      </Sider>

      <Modal
        title="上传文件"
        open={uploadModalVisible}
        footer={null}
        onCancel={() => setUploadModalVisible(false)}
      >
        <FileUpload
          projectId={Number(projectId)}
          onSuccess={() => {
            setUploadModalVisible(false)
            loadFiles()
          }}
        />
      </Modal>

      {/* 标注编辑抽屉 */}
      <Drawer
        title={
          <Space>
            {editingAnnotation ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingAnnotation ? '编辑标注' : '添加标注'}</span>
            {selectedLine && <Tag color="blue">行 {selectedLine}</Tag>}
          </Space>
        }
        width={500}
        open={annotationDrawerVisible}
        onClose={() => {
          setAnnotationDrawerVisible(false)
          setEditingAnnotation(null)
          form.resetFields()
        }}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => {
              setAnnotationDrawerVisible(false)
              setEditingAnnotation(null)
              form.resetFields()
            }}>
              取消
            </Button>
            {editingAnnotation && (
              <Popconfirm
                title="确定删除此标注？"
                onConfirm={() => handleDeleteAnnotation(editingAnnotation.id)}
              >
                <Button danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            )}
            <Button type="primary" onClick={() => form.submit()}>
              保存
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveAnnotation}
          initialValues={{
            annotation_type: 'info',
          }}
        >
          <Form.Item
            name="annotation_type"
            label="标注类型"
            rules={[{ required: true, message: '请选择标注类型' }]}
          >
            <Select size="large">
              <Select.Option value="info">
                <Space>
                  <InfoCircleOutlined style={{ color: '#1890ff' }} />
                  <span>信息 - 功能说明和代码解释</span>
                </Space>
              </Select.Option>
              <Select.Option value="warning">
                <Space>
                  <WarningOutlined style={{ color: '#faad14' }} />
                  <span>警告 - 潜在问题或需要注意的地方</span>
                </Space>
              </Select.Option>
              <Select.Option value="suggestion">
                <Space>
                  <BulbOutlined style={{ color: '#52c41a' }} />
                  <span>建议 - 优化建议</span>
                </Space>
              </Select.Option>
              <Select.Option value="security">
                <Space>
                  <SafetyOutlined style={{ color: '#f5222d' }} />
                  <span>安全 - 安全相关提示</span>
                </Space>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="标注内容"
            rules={[{ required: true, message: '请输入标注内容' }]}
          >
            <Input.TextArea
              rows={6}
              placeholder="请输入标注内容..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          {selectedLine && selectedFile && (
            <div style={{ 
              padding: 12, 
              background: '#f5f5f5', 
              borderRadius: 4,
              marginTop: 16,
            }}>
              <div style={{ marginBottom: 8, color: '#666', fontSize: 12 }}>
                代码预览：
              </div>
              <div style={{ 
                background: '#1e1e1e', 
                padding: 12, 
                borderRadius: 4,
                color: '#d4d4d4',
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: 1.5,
              }}>
                <div style={{ color: '#858585', marginBottom: 4 }}>
                  {selectedLine > 1 && `${selectedLine - 1}: ${selectedFile.content.split('\n')[selectedLine - 2] || ''}`}
                </div>
                <div style={{ background: 'rgba(24, 144, 255, 0.2)', padding: '2px 4px', margin: '0 -4px' }}>
                  {selectedLine}: {selectedFile.content.split('\n')[selectedLine - 1] || ''}
                </div>
                <div style={{ color: '#858585', marginTop: 4 }}>
                  {selectedLine < selectedFile.content.split('\n').length && `${selectedLine + 1}: ${selectedFile.content.split('\n')[selectedLine] || ''}`}
                </div>
              </div>
            </div>
          )}
        </Form>

        {editingAnnotation && (
          <div style={{ marginTop: 24, padding: 12, background: '#f0f0f0', borderRadius: 4 }}>
            <div style={{ fontSize: 12, color: '#666' }}>
              <div>创建时间: {editingAnnotation.created_at || '-'}</div>
              <div>状态: <Tag color={editingAnnotation.status === 'approved' ? 'green' : 'gold'}>
                {editingAnnotation.status === 'approved' ? '已审核' : '待审核'}
              </Tag></div>
            </div>
          </div>
        )}
      </Drawer>

      {/* 带注释代码查看模态框 */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>带注释代码</span>
            {selectedFile && <Tag color="blue">{selectedFile.filename}</Tag>}
          </Space>
        }
        open={annotatedCodeModalVisible}
        onCancel={() => setAnnotatedCodeModalVisible(false)}
        width={1000}
        footer={
          <Space>
            <Button onClick={() => setAnnotatedCodeModalVisible(false)}>
              关闭
            </Button>
            <Button
              icon={<CopyOutlined />}
              onClick={copyAnnotatedCode}
            >
              复制代码
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={downloadAnnotatedCode}
            >
              下载文件
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16, padding: 12, background: '#f0f0f0', borderRadius: 4 }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>📊 统计信息</span>
              <Space>
                <Tag color="blue">行内标注: {annotations.filter(a => a.type === 'line').length}</Tag>
                <Tag color="cyan">函数标注: {annotations.filter(a => a.type === 'function').length}</Tag>
                <Tag color="green">总计: {annotations.length}</Tag>
              </Space>
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              [提示] 此代码已包含所有标注，可直接复制或下载使用
            </div>
          </Space>
        </div>

        <div style={{ 
          border: '1px solid #d9d9d9', 
          borderRadius: 4,
          overflow: 'hidden',
        }}>
          <Editor
            height="600px"
            defaultLanguage={selectedFile?.language || 'python'}
            value={annotatedCode}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: true },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              fontSize: 13,
            }}
          />
        </div>

        <div style={{ marginTop: 16, padding: 12, background: '#e6f7ff', borderRadius: 4, border: '1px solid #91d5ff' }}>
          <div style={{ fontSize: 12, color: '#0050b3' }}>
            <strong>标注说明：</strong>
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
              <li>[INFO] - 功能说明和代码解释</li>
              <li>[WARN] - 潜在问题或需要注意的地方</li>
              <li>[SUGG] - 优化建议</li>
              <li>[SEC] - 安全相关提示</li>
            </ul>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}








