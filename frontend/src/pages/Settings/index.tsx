import { Form, Input, Button, Card, message } from 'antd'
import { useState } from 'react'

export default function Settings() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSave = async (values: any) => {
    try {
      setLoading(true)
      // TODO: 实现保存设置的API调用
      console.log('Settings:', values)
      message.success('设置已保存')
    } catch (error: any) {
      message.error(`保存失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>系统设置</h2>

      <Card title="LLM配置" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            provider: 'openai',
            model: 'gpt-3.5-turbo',
          }}
        >
          <Form.Item
            name="api_key"
            label="OpenAI API Key"
            rules={[{ required: true, message: '请输入API Key' }]}
          >
            <Input.Password placeholder="sk-..." />
          </Form.Item>

          <Form.Item name="model" label="模型">
            <Input placeholder="gpt-3.5-turbo" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="标注类型配置">
        <p style={{ color: '#666' }}>
          标注类型管理功能即将推出...
        </p>
      </Card>
    </div>
  )
}











