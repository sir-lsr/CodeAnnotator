import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ProjectOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons'

const { Sider } = Layout

export default function AppSider() {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: '项目列表',
    },
    {
      key: '/review',
      icon: <CheckCircleOutlined />,
      label: '标注审核',
    },
    {
      key: '/quality',
      icon: <BarChartOutlined />,
      label: '质量评估',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ]

  return (
    <Sider width={200} className="app-sider">
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  )
}









