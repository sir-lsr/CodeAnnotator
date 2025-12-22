import { Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import AppHeader from './components/Layout/Header'
import AppSider from './components/Layout/Sider'
import ProjectList from './pages/ProjectList'
import CodeAnnotation from './pages/CodeAnnotation'
import AnnotationReview from './pages/AnnotationReview'
import QualityAssessment from './pages/QualityAssessment'
import Settings from './pages/Settings'
import './App.css'

const { Content } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        <AppSider />
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
              borderRadius: 8,
            }}
          >
            <Routes>
              <Route path="/" element={<ProjectList />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/annotation/:projectId" element={<CodeAnnotation />} />
              <Route path="/review" element={<AnnotationReview />} />
              <Route path="/quality" element={<QualityAssessment />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default App









