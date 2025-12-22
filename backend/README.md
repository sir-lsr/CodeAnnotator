# CodeAnnotator Backend

代码标注系统后端服务

## 技术栈

- Python 3.10+
- FastAPI
- SQLAlchemy
- SQLite
- OpenAI API / Anthropic Claude

## 安装依赖

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境（Windows）
venv\Scripts\activate

# 激活虚拟环境（Mac/Linux）
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

## 配置

1. 复制`.env.example`为`.env`
2. 配置API密钥：

```env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## 运行

```bash
# 开发模式
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生产模式
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API文档

启动服务后访问:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI应用入口
│   ├── config.py              # 配置管理
│   ├── database.py            # 数据库连接
│   ├── models/                # 数据库模型
│   ├── schemas/               # Pydantic schemas
│   ├── api/                   # API路由
│   └── services/              # 业务逻辑
├── uploads/                   # 上传文件目录
├── requirements.txt           # Python依赖
└── README.md
```

## API接口

### 项目管理
- `POST /api/projects` - 创建项目
- `GET /api/projects` - 获取项目列表
- `GET /api/projects/{id}` - 获取项目详情
- `PUT /api/projects/{id}` - 更新项目
- `DELETE /api/projects/{id}` - 删除项目
- `POST /api/projects/{id}/archive` - 归档项目

### 文件管理
- `POST /api/files/upload` - 上传文件
- `POST /api/files/git-import` - Git导入
- `GET /api/files/{id}` - 获取文件详情
- `GET /api/files/project/{id}/list` - 获取项目文件列表
- `DELETE /api/files/{id}` - 删除文件

### 标注管理
- `POST /api/annotations/generate` - 生成标注
- `GET /api/annotations` - 获取标注列表
- `PUT /api/annotations/{id}` - 更新标注
- `POST /api/annotations/{id}/approve` - 审核通过
- `POST /api/annotations/{id}/reject` - 审核拒绝
- `DELETE /api/annotations/{id}` - 删除标注

## 注意事项

1. API密钥请妥善保管，不要提交到Git
2. 支持的文件类型见`config.py`中的`ALLOWED_EXTENSIONS`
3. 默认使用SQLite数据库，生产环境建议使用PostgreSQL











