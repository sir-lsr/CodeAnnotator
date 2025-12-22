import { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber,
  Select, 
  message, 
  Space, 
  Popconfirm,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { annotationTypeService } from '../services/annotationTypeService';
import type { AnnotationType } from '../services/annotationTypeService';

const ICON_OPTIONS = [
  { value: 'InfoCircle', label: '信息' },
  { value: 'Warning', label: '警告' },
  { value: 'Bulb', label: '建议' },
  { value: 'Lock', label: '安全' },
  { value: 'Bug', label: 'Bug' },
  { value: 'CheckCircle', label: '完成' },
  { value: 'QuestionCircle', label: '疑问' },
  { value: 'Star', label: '重点' },
];

const AnnotationTypeManager = () => {
  const [types, setTypes] = useState<AnnotationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<AnnotationType | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      setLoading(true);
      const data = await annotationTypeService.getAnnotationTypes();
      setTypes(data);
    } catch (error: any) {
      message.error('加载标注类型失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingType(null);
    form.resetFields();
    form.setFieldsValue({
      name: '',
      color: '#1890ff',
      icon: 'InfoCircle',
      priority: 1,
    });
    setModalVisible(true);
  };

  const handleEdit = (record: AnnotationType) => {
    setEditingType(record);
    form.setFieldsValue({
      name: record.name,
      color: record.color,
      icon: record.icon || 'InfoCircle',
      priority: record.priority,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingType) {
        await annotationTypeService.updateAnnotationType(editingType.id, values);
        message.success('标注类型更新成功');
      } else {
        await annotationTypeService.createAnnotationType(values);
        message.success('标注类型创建成功');
      }
      
      setModalVisible(false);
      form.resetFields();
      loadTypes();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请填写所有必填字段');
      } else {
        message.error(error.message || '操作失败');
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await annotationTypeService.deleteAnnotationType(id);
      message.success('标注类型删除成功');
      loadTypes();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const handleInitDefaults = async () => {
    try {
      setLoading(true);
      const result = await annotationTypeService.initDefaultAnnotationTypes();
      message.success(result.message);
      loadTypes();
    } catch (error: any) {
      message.error(error.message || '初始化失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <Space>
          <div
            style={{
              width: 24,
              height: 24,
              backgroundColor: color,
              borderRadius: 4,
              border: '1px solid #d9d9d9',
            }}
          />
          <span>{color}</span>
        </Space>
      ),
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      render: (text: string) => text || '-',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AnnotationType) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此标注类型吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加类型
          </Button>
          <Popconfirm
            title="确定要初始化默认标注类型吗？"
            description="这将添加系统预设的标注类型（不会覆盖已存在的类型）"
            onConfirm={handleInitDefaults}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<ReloadOutlined />}>
              初始化默认类型
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={types}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: '暂无标注类型，请添加或初始化默认类型' }}
      />

      <Modal
        title={editingType ? '编辑标注类型' : '添加标注类型'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            color: '#1890ff',
            icon: 'InfoCircle',
            priority: 1,
          }}
        >
          <Form.Item
            name="name"
            label="类型名称"
            rules={[{ required: true, message: '请输入类型名称' }]}
          >
            <Input placeholder="例如: info, warning, suggestion" />
          </Form.Item>

          <Form.Item
            name="color"
            label="颜色"
            rules={[{ required: true, message: '请选择颜色' }]}
          >
            <Input type="color" />
          </Form.Item>

          <Form.Item name="icon" label="图标">
            <Select>
              {ICON_OPTIONS.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请输入优先级' }]}
            extra="数字越大优先级越高"
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AnnotationTypeManager;
