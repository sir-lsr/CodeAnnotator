import { Form, Radio, Switch, Card, Divider, Space, Alert } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

interface ExportSettingsProps {
  settings: {
    exportFormat?: string;
    exportIncludeOriginal?: boolean;
    exportIncludeTimestamp?: boolean;
    exportIncludeStatistics?: boolean;
  };
  onChange: (key: string, value: any) => void;
}

const ExportSettings: React.FC<ExportSettingsProps> = ({ settings, onChange }) => {
  return (
    <div>
      <Alert
        message="导出设置说明"
        description="这些设置将影响导出带标注代码文件的格式和内容"
        type="info"
        showIcon
        icon={<DownloadOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Card title="导出格式" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label="文件格式">
            <Radio.Group
              value={settings.exportFormat || 'annotated'}
              onChange={(e) => onChange('exportFormat', e.target.value)}
            >
              <Space direction="vertical">
                <Radio value="annotated">
                  <strong>带标注的源代码</strong>
                  <div style={{ color: '#666', fontSize: '12px', marginLeft: 24 }}>
                    在原代码中插入标注注释
                  </div>
                </Radio>
                <Radio value="markdown">
                  <strong>Markdown 格式</strong>
                  <div style={{ color: '#666', fontSize: '12px', marginLeft: 24 }}>
                    生成包含代码和标注的 Markdown 文档
                  </div>
                </Radio>
                <Radio value="html">
                  <strong>HTML 格式</strong>
                  <div style={{ color: '#666', fontSize: '12px', marginLeft: 24 }}>
                    生成可在浏览器中查看的 HTML 文档
                  </div>
                </Radio>
                <Radio value="json">
                  <strong>JSON 格式</strong>
                  <div style={{ color: '#666', fontSize: '12px', marginLeft: 24 }}>
                    导出结构化的 JSON 数据，包含代码和所有标注信息
                  </div>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Card>

      <Card title="导出选项">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div><strong>包含原始代码</strong></div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                在导出文件中包含完整的原始代码
              </div>
            </div>
            <Switch
              checked={settings.exportIncludeOriginal !== false}
              onChange={(checked) => onChange('exportIncludeOriginal', checked)}
            />
          </div>

          <Divider style={{ margin: '12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div><strong>包含时间戳</strong></div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                在导出文件中添加生成时间信息
              </div>
            </div>
            <Switch
              checked={settings.exportIncludeTimestamp !== false}
              onChange={(checked) => onChange('exportIncludeTimestamp', checked)}
            />
          </div>

          <Divider style={{ margin: '12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div><strong>包含统计信息</strong></div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                在导出文件中添加标注统计数据（标注数量、类型分布等）
              </div>
            </div>
            <Switch
              checked={settings.exportIncludeStatistics !== false}
              onChange={(checked) => onChange('exportIncludeStatistics', checked)}
            />
          </div>
        </Space>
      </Card>

      <Alert
        message="格式预览"
        description={
          <div style={{ marginTop: 8 }}>
            <strong>当前配置将生成：</strong>
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
              <li>格式：{getFormatLabel(settings.exportFormat || 'annotated')}</li>
              <li>原始代码：{settings.exportIncludeOriginal !== false ? '包含' : '不包含'}</li>
              <li>时间戳：{settings.exportIncludeTimestamp !== false ? '包含' : '不包含'}</li>
              <li>统计信息：{settings.exportIncludeStatistics !== false ? '包含' : '不包含'}</li>
            </ul>
          </div>
        }
        type="success"
        showIcon
        style={{ marginTop: 16 }}
      />
    </div>
  );
};

const getFormatLabel = (format: string): string => {
  const labels: Record<string, string> = {
    annotated: '带标注的源代码',
    markdown: 'Markdown 文档',
    html: 'HTML 网页',
    json: 'JSON 数据',
  };
  return labels[format] || format;
};

export default ExportSettings;

