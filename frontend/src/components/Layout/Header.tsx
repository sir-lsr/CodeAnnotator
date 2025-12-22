import { Layout } from 'antd'
import { CodeOutlined } from '@ant-design/icons'

const { Header } = Layout

export default function AppHeader() {
  return (
    <Header className="app-header">
      <div className="app-logo">
        <CodeOutlined style={{ marginRight: 8 }} />
        代码标注系统
      </div>
      <div>
        <span style={{ marginRight: 16 }}></span>
      </div>
    </Header>
  )
}








