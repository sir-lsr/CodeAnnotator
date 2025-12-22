# CodeAnnotator

智能代码标注系统 - 使用 AI 自动为代码添加专业注释和标注

## 项目简介

CodeAnnotator 是一个基于 AI 的智能代码标注系统，可以帮助开发者快速为代码添加注释、识别潜在问题、提供优化建议。系统支持多种编程语言，集成了 OpenAI、Claude 和 Ollama 等多种 LLM 提供商。

## 主要特性

- **AI 智能标注**：使用大语言模型自动生成代码注释和标注
- **多 LLM 支持**：支持 OpenAI、Claude (Anthropic)、Ollama 三种提供商
- **可视化标注**：Monaco Editor 提供 VS Code 级别的代码编辑体验
- **标注管理**：支持手动添加、编辑、审核标注
- **质量评估**：自动分析代码质量，生成质量报告
- **多语言支持**：支持 Python、JavaScript、Java、C++、Go 等多种编程语言
- **项目组织**：支持多项目管理，文件分类管理

## 技术栈

### 后端
- Python 3.10+
- FastAPI - 现代化 Web 框架
- SQLAlchemy - ORM 数据库操作
- SQLite - 轻量级数据库
- OpenAI / Anthropic / Ollama - AI 模型集成

### 前端
- React 18 - UI 框架
- TypeScript - 类型安全
- Ant Design - UI 组件库
- Monaco Editor - 代码编辑器
- Vite - 构建工具
- React Router - 路由管理

## 快速开始

### 前置要求

- Python 3.10 或更高版本
- Node.js 16 或更高版本
- npm 或 yarn

### 一键安装（Windows）

```bash
# 运行安装脚本
install.bat

# 启动服务
start-all.bat
```

### 手动安装

#### 1. 克隆仓库

```bash
git clone https://github.com/your-username/CodeAnnotator.git
cd CodeAnnotator
```

#### 2. 安装后端依赖

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

#### 3. 配置后端

复制 `backend/env.example` 为 `backend/.env`，并配置 API 密钥：

```env
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
DEFAULT_LLM_PROVIDER=openai
DEFAULT_MODEL=gpt-3.5-turbo
```

#### 4. 安装前端依赖

```bash
cd frontend
npm install
```

#### 5. 启动服务

**后端服务：**

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**前端服务：**

```bash
cd frontend
npm run dev
```

访问 http://localhost:5173 即可使用系统。

## 使用说明

### 1. 创建项目

在项目列表页面点击"新建项目"，输入项目名称和描述。

### 2. 上传代码文件

进入项目后，点击"上传文件"按钮，选择代码文件上传。系统会自动识别编程语言。

### 3. 生成 AI 标注

在代码标注页面，选择文件后点击"生成标注"按钮。系统会调用配置的 LLM 自动生成代码注释和标注。

### 4. 手动添加标注

点击代码行号，在弹出的表单中填写标注内容和类型（信息/警告/建议/安全）。

### 5. 审核标注

在标注审核页面，可以查看所有待审核的标注，进行批量审核操作。

### 6. 查看质量报告

在质量评估页面，可以查看项目的整体质量评分和详细统计信息。

## 配置说明

### LLM 配置

系统支持三种 LLM 提供商：

1. **OpenAI**
   - 支持 GPT-3.5、GPT-4 等模型
   - 支持自定义 API 地址（兼容 DeepSeek 等）

2. **Claude (Anthropic)**
   - 支持 Claude 3 系列模型

3. **Ollama（本地）**
   - 支持本地部署的 Ollama 服务
   - 默认地址：http://localhost:11434

在系统设置页面可以配置 LLM 提供商、API 密钥和模型选择。

### 标注类型

系统默认支持四种标注类型：

- **info**：功能说明和代码解释
- **warning**：潜在问题或需要注意的地方
- **suggestion**：优化建议
- **security**：安全相关提示

可以在设置页面自定义标注类型。

## API 文档

启动后端服务后，访问以下地址查看 API 文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 项目结构

```
CodeAnnotator/
├── backend/                 # 后端服务
│   ├── app/
│   │   ├── api/            # API 路由
│   │   ├── models/         # 数据模型
│   │   ├── schemas/        # 数据验证
│   │   ├── services/       # 业务逻辑
│   │   ├── config.py       # 配置管理
│   │   ├── database.py     # 数据库连接
│   │   └── main.py         # 应用入口
│   ├── uploads/            # 上传文件目录
│   ├── requirements.txt    # Python 依赖
│   └── README.md           # 后端说明文档
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/    # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API 服务
│   │   └── types/         # TypeScript 类型
│   ├── package.json       # 前端依赖
│   └── README.md          # 前端说明文档
├── ARCHITECTURE.md         # 技术架构文档
├── .gitignore             # Git 忽略文件
└── README.md              # 项目主文档
```

## 开发指南

### 后端开发

```bash
cd backend
source venv/bin/activate  # 或 venv\Scripts\activate (Windows)
uvicorn app.main:app --reload
```

### 前端开发

```bash
cd frontend
npm run dev
```

### 代码规范

- 后端：遵循 PEP 8 Python 代码规范
- 前端：使用 ESLint 和 Prettier 进行代码格式化

## 贡献指南

欢迎贡献代码！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 常见问题

### Q: 如何配置 API 密钥？

A: 在系统设置页面配置 LLM API 密钥，或直接在 `backend/.env` 文件中配置。

### Q: 支持哪些编程语言？

A: 支持 Python、JavaScript、TypeScript、Java、C++、Go、Rust 等多种主流编程语言。

### Q: 可以使用本地 LLM 吗？

A: 可以，使用 Ollama 可以在本地运行 LLM，无需 API 密钥。

### Q: 数据库文件在哪里？

A: 默认使用 SQLite 数据库，文件位于 `backend/database.db`。生产环境建议使用 PostgreSQL。

### Q: 如何备份数据？

A: 备份 `backend/database.db` 文件即可。上传的文件位于 `backend/uploads/` 目录。

## 更新日志

### v0.3.0
- 支持多种 LLM 提供商
- 优化 AI 标注生成质量
- 添加质量评估功能
- 改进用户界面

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。

## 致谢

感谢所有贡献者和开源社区的支持。

