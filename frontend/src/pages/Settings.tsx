import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import api from '../services/api';
import AnnotationTypeManager from '../components/AnnotationTypeManager';
import ExportSettings from '../components/ExportSettings';

interface AnnotationType {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface UserSettings {
  theme: string;
  language: string;
  autoSave: boolean;
  fontSize: number;
  editorTheme: string;
  llmProvider: string;
  llmModel: string;
  openaiApiKey: string;
  openaiBaseUrl: string;
  anthropicApiKey: string;
  annotationTypes?: AnnotationType[];
  exportFormat?: string;
  exportIncludeOriginal?: boolean;
  exportIncludeTimestamp?: boolean;
  exportIncludeStatistics?: boolean;
}

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    language: 'zh',
    autoSave: true,
    fontSize: 14,
    editorTheme: 'vs-dark',
    llmProvider: 'openai',
    llmModel: 'gpt-3.5-turbo',
    openaiApiKey: '',
    openaiBaseUrl: '',
    anthropicApiKey: '',
    annotationTypes: [
      { id: 'info', name: '信息', color: '#1890ff', description: '功能说明和代码解释' },
      { id: 'warning', name: '警告', color: '#faad14', description: '潜在问题或需要注意的地方' },
      { id: 'suggestion', name: '建议', color: '#52c41a', description: '优化建议' },
      { id: 'security', name: '安全', color: '#f5222d', description: '安全相关提示' },
    ],
    exportFormat: 'markdown',
    exportIncludeOriginal: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingApi, setTestingApi] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response: any = await api.get('/settings');
      console.log('加载设置响应:', response);
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('保存设置数据:', settings);
      const response: any = await api.put('/settings', settings);
      console.log('保存设置响应:', response);
      if (response.success) {
        alert('设置保存成功！');
        // 应用主题
        document.documentElement.setAttribute('data-theme', settings.theme);
      } else {
        alert('保存设置失败：' + (response.message || '未知错误'));
      }
    } catch (error: any) {
      console.error('保存设置失败:', error);
      const errorMessage = error.response?.data?.detail || error.message || '未知错误';
      alert('保存设置失败：' + errorMessage + '\n请查看浏览器控制台了解详情');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('确定要重置所有设置为默认值吗？')) {
      return;
    }
    
    setSaving(true);
    try {
      const response: any = await api.post('/settings/reset');
      console.log('重置设置响应:', response);
      if (response.success) {
        setSettings(response.data);
        alert('设置已重置！');
      }
    } catch (error: any) {
      console.error('重置设置失败:', error);
      const errorMessage = error.response?.data?.detail || error.message || '未知错误';
      alert('重置设置失败：' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleTestApi = async () => {
    setTestingApi(true);
    try {
      const response: any = await api.post('/settings/test-api', settings);
      if (response.success) {
        alert(`[成功] ${response.message}\n模型: ${response.model}`);
      }
    } catch (error: any) {
      console.error('API 测试失败:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'API 连接测试失败';
      alert(`[失败] ${errorMessage}\n\n请检查：\n• API 密钥是否正确\n• 网络连接是否正常\n• API 额度是否充足`);
    } finally {
      setTestingApi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftOutlined className="text-xl text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                disabled={saving}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ReloadOutlined className="mr-2" />
                重置
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <SaveOutlined className="mr-2" />
                {saving ? '保存中...' : '保存设置'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 设置内容 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'general',
              label: '常规设置',
              children: (
                <>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* 外观设置 */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">外观设置</h2>
            
            <div className="space-y-4">
              {/* 主题 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">主题</label>
                  <p className="text-sm text-gray-500 mt-1">选择界面主题</p>
                </div>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                  <option value="auto">跟随系统</option>
                </select>
              </div>

              {/* 字体大小 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">字体大小</label>
                  <p className="text-sm text-gray-500 mt-1">调整编辑器字体大小</p>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={settings.fontSize}
                    onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-700 w-12">{settings.fontSize}px</span>
                </div>
              </div>

              {/* 编辑器主题 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">编辑器主题</label>
                  <p className="text-sm text-gray-500 mt-1">代码编辑器的配色方案</p>
                </div>
                <select
                  value={settings.editorTheme}
                  onChange={(e) => setSettings({ ...settings, editorTheme: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vs-dark">VS Dark</option>
                  <option value="vs-light">VS Light</option>
                  <option value="hc-black">High Contrast</option>
                </select>
              </div>
            </div>
          </div>

          {/* 语言设置 */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">语言设置</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">界面语言</label>
                <p className="text-sm text-gray-500 mt-1">选择系统界面语言</p>
              </div>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="zh">简体中文</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* LLM API 配置 */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">LLM API 配置</h2>
            
            <div className="space-y-4">
              {/* 选择 LLM 提供商 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">LLM 提供商</label>
                  <p className="text-sm text-gray-500 mt-1">选择 AI 服务提供商</p>
                </div>
                <select
                  value={settings.llmProvider}
                  onChange={(e) => setSettings({ ...settings, llmProvider: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="ollama">Ollama (本地)</option>
                </select>
              </div>

              {/* OpenAI 配置 */}
              {settings.llmProvider === 'openai' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      OpenAI API 密钥 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={settings.openaiApiKey}
                        onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                        placeholder="sk-proj-xxxxxxxxxxxx"
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        {showApiKey ? '隐藏' : '显示'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      从 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI 控制台</a> 获取 API 密钥
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">选择模型</label>
                    <select
                      value={settings.llmModel}
                      onChange={(e) => setSettings({ ...settings, llmModel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo（推荐，性价比高）</option>
                      <option value="gpt-4">GPT-4（更强大，费用较高）</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo（速度快，能力强）</option>
                      <option value="gpt-4o">GPT-4o（最新模型）</option>
                    </select>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>[提示] 费用参考（500行代码）：</p>
                      <p>• GPT-3.5 Turbo: ~$0.01-0.05</p>
                      <p>• GPT-4: ~$0.05-0.20</p>
                      <p>• GPT-4 Turbo: ~$0.03-0.10</p>
                    </div>
                  </div>
                </>
              )}

              {/* Anthropic 配置 */}
              {settings.llmProvider === 'anthropic' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Anthropic API 密钥 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={settings.anthropicApiKey}
                        onChange={(e) => setSettings({ ...settings, anthropicApiKey: e.target.value })}
                        placeholder="sk-ant-xxxxxxxxxxxx"
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        {showApiKey ? '隐藏' : '显示'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      从 <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Anthropic 控制台</a> 获取 API 密钥
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">选择模型</label>
                    <select
                      value={settings.llmModel}
                      onChange={(e) => setSettings({ ...settings, llmModel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="claude-3-haiku">Claude 3 Haiku（快速，经济）</option>
                      <option value="claude-3-sonnet">Claude 3 Sonnet（推荐，平衡）</option>
                      <option value="claude-3-opus">Claude 3 Opus（最强大）</option>
                    </select>
                  </div>
                </>
              )}

              {/* Ollama 配置 */}
              {settings.llmProvider === 'ollama' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    [提示] Ollama 可在本地运行，无需 API 密钥，但需要先安装 Ollama。
                  </p>
                  <a 
                    href="https://ollama.ai" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                  >
                    前往 Ollama 官网下载 →
                  </a>
                </div>
              )}

              {/* 测试 API 按钮 */}
              {settings.llmProvider !== 'ollama' && (
                <div>
                  <button
                    onClick={handleTestApi}
                    disabled={testingApi || (settings.llmProvider === 'openai' && !settings.openaiApiKey) || (settings.llmProvider === 'anthropic' && !settings.anthropicApiKey)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingApi ? '测试中...' : '测试 API 连接'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    保存前建议先测试 API 连接是否正常
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 编辑器设置 */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">编辑器设置</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">自动保存</label>
                <p className="text-sm text-gray-500 mt-1">标注后自动保存更改</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

                  {/* 安全提示 */}
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-amber-900 mb-2">[安全提示]</h3>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• API 密钥将安全存储在后端服务器</li>
                      <li>• 请勿与他人分享你的 API 密钥</li>
                      <li>• 定期在提供商控制台查看 API 使用情况</li>
                      <li>• 建议设置使用限额，避免意外费用</li>
                    </ul>
                  </div>

                  {/* 提示信息 */}
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      [提示] 部分设置可能需要刷新页面后才能完全生效。
                    </p>
                  </div>
                </>
              ),
            },
            {
              key: 'annotation-types',
              label: '标注类型',
              children: <AnnotationTypeManager />,
            },
            {
              key: 'export',
              label: '导出设置',
              children: (
                <ExportSettings
                  settings={{
                    exportFormat: settings.exportFormat,
                    exportIncludeOriginal: settings.exportIncludeOriginal,
                    exportIncludeTimestamp: settings.exportIncludeTimestamp,
                    exportIncludeStatistics: settings.exportIncludeStatistics,
                  }}
                  onChange={(key, value) => setSettings({ ...settings, [key]: value })}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Settings;
