# CodeAnnotator 技术架构文档

> 本文档提供项目整体架构的说明

## 项目概述

CodeAnnotator 是一个智能代码标注系统，采用前后端分离架构：

- **后端**：FastAPI + SQLAlchemy + SQLite，提供 RESTful API 服务
- **前端**：React + TypeScript + Ant Design，提供用户交互界面
- **AI 集成**：支持 OpenAI、Claude、Ollama 三种 LLM 提供商

---

## 后端架构

### 核心模块

#### 1. 应用入口与配置

**`main.py`** - FastAPI 应用主入口
- 创建 FastAPI 应用实例
- 配置 CORS 中间件
- 注册所有 API 路由
- 初始化数据库

**`config.py`** - 全局配置管理
- 数据库连接配置
- 文件上传目录配置
- LLM API 密钥配置
- 支持的文件类型定义

**`database.py`** - 数据库连接与会话管理
- 创建 SQLAlchemy 引擎
- 提供数据库会话工厂
- 实现依赖注入模式

#### 2. 数据模型层

**`project.py`** - 项目数据模型
- 定义项目基本信息（名称、描述、归档状态）

**`file.py`** - 文件数据模型
- 定义文件信息（文件名、路径、内容、语言）
- 关联到项目（多对一关系）

**`annotation.py`** - 标注数据模型
- 定义标注信息（类型、内容、状态）
- 支持行内标注和函数标注
- 关联到文件（多对一关系）

**`setting.py`** - 系统设置数据模型
- 键值对存储配置信息

#### 3. API 路由层

**`projects.py`** - 项目管理 API
- 创建、查询、更新、删除项目
- 获取项目详情和列表
- 归档项目

**`files.py`** - 文件管理 API
- 上传文件（验证类型、保存到磁盘、读取内容）
- 查询文件列表和详情
- 更新和删除文件
- Git 仓库导入

**`annotations.py`** - 标注管理 API
- AI 生成标注（核心功能）
- 手动创建、编辑、删除标注
- 批量生成行内和函数标注
- 标注审核（通过/拒绝）

**`annotation_types.py`** - 标注类型管理 API
- 管理标注类型（info/warning/suggestion/security）
- 自定义标注类型

**`quality.py`** - 质量评估 API
- 计算文件质量指标
- 计算项目整体质量
- 生成质量报告

**`settings.py`** - 系统设置 API
- 获取和保存用户设置
- 测试 LLM 连接
- 导出配置

#### 4. 业务逻辑层

**`llm_service.py`** - LLM 服务（核心 AI 集成）
- 支持 OpenAI、Claude、Ollama 三种 LLM 提供商
- 动态配置切换
- 生成行内标注和函数标注
- Prompt 工程优化
- 完善的错误处理

**`code_parser.py`** - 代码解析服务
- 解析代码文件，提取函数、类等结构
- 支持多种编程语言
- 获取准确的行号范围

**`file_service.py`** - 文件处理服务
- 文件上传、读取、保存
- 自动识别编程语言
- 多种编码支持

**`quality_service.py`** - 质量评估服务
- 计算代码质量指标
- 统计标注分布
- 生成质量评分

---

## 前端架构

### 核心模块

#### 1. 应用入口

**`main.tsx`** - React 应用入口
- 渲染根组件
- 配置 React Router

**`App.tsx`** - 根组件和路由配置
- 定义应用整体布局（Header、Sider、Content）
- 配置页面路由

#### 2. 布局组件

**`Header.tsx`** - 顶部导航栏
- 显示应用标题和 Logo

**`Sider.tsx`** - 侧边栏菜单
- 导航菜单
- 路由跳转
- 菜单项高亮

#### 3. 功能组件

**`FileUpload/index.tsx`** - 文件上传组件
- 文件选择、上传进度、拖拽上传

**`AnnotationTypeManager.tsx`** - 标注类型管理
- 显示、添加、编辑、删除标注类型

**`ExportSettings.tsx`** - 导出设置组件
- 选择导出格式（JSON/Markdown）
- 配置导出内容

**`QualityCharts.tsx`** - 质量图表组件
- 使用 ECharts 可视化质量数据

#### 4. 页面组件

**`ProjectList/index.tsx`** - 项目列表页
- 显示所有项目（卡片或表格）
- 创建、编辑、删除项目
- 搜索和筛选

**`CodeAnnotation/index.tsx`** - 代码标注页（核心页面）
- 三栏布局：文件树 + 代码编辑器 + 标注列表
- Monaco Editor 集成
- 行号点击添加标注
- AI 生成标注
- 可视化标注装饰器

**`AnnotationReview/index.tsx`** - 标注审核页
- 显示待审核的标注
- 批量审核操作

**`QualityAssessment/index.tsx`** - 质量评估页
- 显示质量报告
- 可视化图表展示

**`Settings/index.tsx`** - 系统设置页
- LLM 配置
- 标注类型管理
- 导出设置

#### 5. API 服务层

**`api.ts`** - Axios 实例配置
- 配置 baseURL
- 统一错误处理

**`projectService.ts`** - 项目 API 服务
- 封装项目相关的 API 调用

**`fileService.ts`** - 文件 API 服务
- 封装文件相关的 API 调用

**`annotationService.ts`** - 标注 API 服务
- 封装标注相关的 API 调用
- 调用 AI 生成标注

**`annotationTypeService.ts`** - 标注类型 API 服务
- 封装标注类型相关的 API 调用

**`qualityService.ts`** - 质量评估 API 服务
- 封装质量评估相关的 API 调用

#### 6. 类型定义

**`index.ts`** - TypeScript 类型定义
- 定义所有数据模型的接口
- 提供类型检查和 IDE 智能提示

---

## 数据流转

### 标注生成流程

1. 用户点击"生成标注"按钮
2. 前端发送请求到后端 API
3. 后端加载用户 LLM 配置
4. 创建 LLM 服务实例
5. 构建 Prompt 并调用 AI API
6. AI 返回标注数据（JSON 格式）
7. 后端解析并保存到数据库
8. 前端刷新标注列表
9. Monaco Editor 显示可视化标注

### 手动添加标注流程

1. 用户点击代码行号
2. 打开标注表单（Drawer）
3. 填写标注内容和类型
4. 保存到数据库
5. 更新编辑器装饰器
6. 标注显示在列表中

---

## 部署脚本

### Windows 批处理脚本

**`install.bat`** - 一键安装脚本
- 检查 Python 和 Node.js
- 安装后端和前端依赖

**`start-all.bat`** - 启动所有服务
- 启动后端（8000 端口）
- 启动前端（5173 端口）

**`stop-all.bat`** - 停止所有服务
- 终止所有相关进程

**`fix-database.bat`** - 数据库修复工具
- 检查和修复数据库
- 重新初始化数据表

---

## 关键技术点

### 1. 数据库设计
- SQLAlchemy ORM
- 关系映射：Project → File → Annotation
- 外键约束确保数据完整性

### 2. API 设计
- RESTful 风格
- Pydantic 数据验证
- 自动生成 OpenAPI 文档

### 3. AI 集成
- 支持多个 LLM 提供商
- 动态配置切换
- Prompt 工程优化

### 4. 前端架构
- 组件化设计（React）
- 类型安全（TypeScript）
- Monaco Editor 深度集成

### 5. 代码编辑器
- VS Code 级别的编辑体验
- 自定义装饰器
- 实时可视化标注

### 6. 用户体验
- 一键安装和启动
- 实时反馈和加载状态
- 友好的错误提示

---

## 总结

CodeAnnotator 是一个功能完整、架构清晰的代码标注系统：

- **后端**：FastAPI + SQLAlchemy 提供稳定的 API 服务，集成多个 LLM 提供商实现 AI 智能标注
- **前端**：React + TypeScript + Ant Design 提供现代化的用户界面，Monaco Editor 提供专业级代码编辑体验
- **数据流**：前后端通过 RESTful API 通信，数据存储在 SQLite 数据库
- **部署**：提供完善的一键安装和启动脚本


