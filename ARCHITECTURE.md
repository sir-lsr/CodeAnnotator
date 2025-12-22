# CodeAnnotator 技术架构文档

> 本文档详细说明项目中各个文件的功能实现和技术细节

## 目录

- [项目概述](#项目概述)
- [后端架构](#后端架构)
- [前端架构](#前端架构)
- [数据流转](#数据流转)
- [部署脚本](#部署脚本)

---

## 项目概述

CodeAnnotator 是一个智能代码标注系统，采用前后端分离架构：
- **后端**：FastAPI + SQLAlchemy + SQLite，提供 RESTful API 服务
- **前端**：React + TypeScript + Ant Design，提供用户交互界面
- **AI 集成**：支持 OpenAI、Claude、Ollama 三种 LLM 提供商

---

## 后端架构

### backend/app/ - 核心应用目录

#### 1. 应用入口与配置

**`main.py`** - FastAPI 应用主入口
```python
功能：
- 创建 FastAPI 应用实例
- 配置 CORS 中间件（允许前端跨域访问）
- 注册所有 API 路由模块
- 定义应用生命周期事件（启动时初始化数据库）
- 提供健康检查和根路径接口

关键代码：
- app = FastAPI() - 创建应用
- app.add_middleware(CORSMiddleware) - 配置跨域
- app.include_router() - 注册路由
- @app.on_event("startup") - 启动时初始化数据库
```

**`config.py`** - 全局配置管理
```python
功能：
- 定义应用配置类（使用 Pydantic Settings）
- 设置数据库连接字符串
- 配置上传文件目录路径
- 定义允许的文件扩展名列表
- 管理 LLM API 密钥和默认模型
- 设置 API 路径前缀

配置项：
- APP_NAME: 应用名称
- DATABASE_URL: 数据库连接 URL
- UPLOAD_DIR: 文件上传目录
- ALLOWED_EXTENSIONS: 支持的代码文件类型
- OPENAI_API_KEY / ANTHROPIC_API_KEY: AI API 密钥
- DEFAULT_LLM_PROVIDER: 默认 LLM 提供商
```

**`database.py`** - 数据库连接与会话管理
```python
功能：
- 创建 SQLAlchemy 引擎（连接数据库）
- 定义 SessionLocal（数据库会话工厂）
- 提供 Base 类（ORM 模型基类）
- 实现 get_db() 依赖注入函数（为 API 提供数据库会话）
- 提供 init_db() 初始化函数（创建所有数据表）

关键技术：
- 使用上下文管理器自动关闭数据库会话
- 支持依赖注入模式
```

#### 2. 数据模型层 - models/

**`project.py`** - 项目数据模型
```python
功能：定义 Project 表结构
字段：
- id: 主键
- name: 项目名称
- description: 项目描述
- created_at: 创建时间
- updated_at: 更新时间
- is_archived: 是否归档

关系：
- files: 关联到 File 模型（一对多）
```

**`file.py`** - 文件数据模型
```python
功能：定义 File 表结构
字段：
- id: 主键
- project_id: 外键（关联项目）
- filename: 文件名
- filepath: 文件路径
- content: 文件内容（存储代码文本）
- language: 编程语言（python/javascript/java等）
- size: 文件大小
- created_at: 创建时间
- updated_at: 更新时间

关系：
- project: 关联到 Project 模型（多对一）
- annotations: 关联到 Annotation 模型（一对多）
```

**`annotation.py`** - 标注数据模型
```python
功能：定义 Annotation 和 AnnotationType 表结构

Annotation 表：
- id: 主键
- file_id: 外键（关联文件）
- type: 标注类型（line=行内标注, function=函数标注）
- line_number: 行号（行内标注使用）
- line_end: 结束行号（函数标注使用）
- function_name: 函数名称
- content: 标注内容
- annotation_type: 标注分类（info/warning/suggestion/security）
- status: 审核状态（pending/approved/rejected）
- color: 颜色标识
- created_at: 创建时间
- updated_at: 更新时间

AnnotationType 表：
- id: 主键
- name: 类型名称
- color: 颜色代码
- icon: 图标名称
- priority: 优先级（数字越大越重要）

关系：
- file: 关联到 File 模型（多对一）
```

**`setting.py`** - 系统设置数据模型
```python
功能：定义 Setting 表结构（键值对存储配置）
字段：
- id: 主键
- key: 配置键名（唯一）
- value: 配置值（JSON 字符串）
- description: 配置描述
- created_at: 创建时间
- updated_at: 更新时间

用途：存储系统配置，如 LLM 设置、导出配置等
```

#### 3. 数据验证层 - schemas/

**`project.py`** - 项目数据验证模式
```python
功能：定义项目相关的 Pydantic 模型
模型：
- ProjectBase: 基础字段（name, description）
- ProjectCreate: 创建项目时的数据验证
- ProjectUpdate: 更新项目时的数据验证
- ProjectResponse: 返回给前端的数据结构

作用：
- 自动验证 API 请求数据格式
- 自动生成 API 文档
- 类型提示和 IDE 支持
```

**`file.py`** - 文件数据验证模式
```python
功能：定义文件相关的 Pydantic 模型
模型：
- FileBase: 基础字段
- FileCreate: 创建文件数据验证
- FileUpdate: 更新文件数据验证
- FileResponse: 返回数据结构（包含统计信息）

特殊字段：
- annotation_count: 标注数量（计算字段）
```

**`annotation.py`** - 标注数据验证模式
```python
功能：定义标注相关的 Pydantic 模型
模型：
- AnnotationBase: 基础字段
- AnnotationCreate: 创建标注数据验证
- AnnotationUpdate: 更新标注数据验证
- AnnotationResponse: 返回数据结构
- AnnotationTypeCreate: 标注类型创建
- AnnotationTypeResponse: 标注类型返回

验证规则：
- type 必须是 'line' 或 'function'
- annotation_type 必须是预定义类型之一
- line_number 在 line 类型时必填
```

**`llm.py`** - LLM 请求数据验证
```python
功能：定义 LLM 相关的 Pydantic 模型
模型：
- LLMGenerateRequest: AI 生成标注的请求参数
  - file_id: 文件 ID
  - generate_line_annotations: 是否生成行内标注
  - generate_function_annotations: 是否生成函数标注
- LLMTestRequest: 测试 LLM 连接的请求参数
```

**`quality.py`** - 质量评估数据验证
```python
功能：定义质量评估相关的 Pydantic 模型
模型：
- QualityMetrics: 质量指标数据
- QualityReport: 质量报告数据结构

字段：包含代码行数、标注数、问题分布等统计数据
```

#### 4. API 路由层 - api/

**`projects.py`** - 项目管理 API
```python
路由前缀：/api/projects

接口列表：
1. POST /api/projects - 创建项目
   - 接收：ProjectCreate 数据
   - 返回：ProjectResponse
   - 功能：创建新项目并保存到数据库

2. GET /api/projects - 获取项目列表
   - 参数：skip（分页偏移）、limit（每页数量）
   - 返回：List[ProjectResponse]
   - 功能：分页查询所有项目

3. GET /api/projects/{project_id} - 获取项目详情
   - 参数：project_id
   - 返回：ProjectResponse（包含文件列表和统计）
   - 功能：查询单个项目及其关联数据

4. PUT /api/projects/{project_id} - 更新项目
   - 接收：ProjectUpdate 数据
   - 返回：ProjectResponse
   - 功能：更新项目名称、描述等信息

5. DELETE /api/projects/{project_id} - 删除项目
   - 功能：删除项目及其所有文件和标注（级联删除）

6. POST /api/projects/{project_id}/archive - 归档项目
   - 功能：标记项目为已归档状态

实现技术：
- 使用 Depends(get_db) 依赖注入数据库会话
- 使用 SQLAlchemy ORM 查询和操作数据
- HTTPException 处理错误（404/400等）
```

**`files.py`** - 文件管理 API
```python
路由前缀：/api/files

接口列表：
1. POST /api/files/upload - 上传文件
   - 接收：UploadFile（multipart/form-data）
   - 参数：project_id
   - 功能：
     * 验证文件扩展名
     * 保存文件到 uploads/{project_id}/ 目录
     * 读取文件内容并存储到数据库
     * 自动识别编程语言
   - 返回：FileResponse

2. GET /api/files/{file_id} - 获取文件详情
   - 返回：FileResponse（包含完整代码内容）

3. GET /api/files/project/{project_id}/list - 获取项目文件列表
   - 返回：List[FileResponse]
   - 功能：查询指定项目的所有文件

4. PUT /api/files/{file_id} - 更新文件
   - 接收：FileUpdate 数据
   - 功能：更新文件内容或元数据

5. DELETE /api/files/{file_id} - 删除文件
   - 功能：删除文件记录和物理文件

6. POST /api/files/git-import - Git 仓库导入（预留）
   - 功能：从 Git 仓库批量导入文件

关键实现：
- 使用 aiofiles 异步读写文件
- 根据文件扩展名自动识别语言
- 文件存储采用 {project_id}/{filename} 结构
```

**`annotations.py`** - 标注管理 API
```python
路由前缀：/api/annotations

接口列表：
1. POST /api/annotations/generate - AI 生成标注（核心功能）
   - 接收：LLMGenerateRequest
   - 流程：
     * 查询文件内容
     * 加载用户 LLM 配置（user_settings.json）
     * 创建 LLMService 实例
     * 调用 generate_line_annotations（行内标注）
     * 调用 code_parser 解析函数
     * 调用 generate_function_annotations（函数标注）
     * 批量保存标注到数据库
   - 返回：生成的标注数量

2. POST /api/annotations/ - 手动创建标注
   - 接收：AnnotationCreate
   - 返回：AnnotationResponse

3. GET /api/annotations - 查询标注列表
   - 参数：file_id、annotation_type、status（可选过滤）
   - 返回：List[AnnotationResponse]

4. PUT /api/annotations/{annotation_id} - 更新标注
   - 接收：AnnotationUpdate
   - 功能：修改标注内容、类型或状态

5. POST /api/annotations/{annotation_id}/approve - 审核通过
   - 功能：将标注状态改为 approved

6. POST /api/annotations/{annotation_id}/reject - 审核拒绝
   - 功能：将标注状态改为 rejected

7. DELETE /api/annotations/{annotation_id} - 删除标注

辅助函数：
- _load_user_settings(): 加载 user_settings.json
- _get_color_for_type(): 根据类型获取颜色代码
- _build_function_annotation_content(): 格式化函数标注内容
```

**`annotation_types.py`** - 标注类型管理 API
```python
路由前缀：/api/annotation-types

接口列表：
1. GET /api/annotation-types - 获取所有标注类型
   - 返回：List[AnnotationTypeResponse]
   - 功能：查询系统中配置的所有标注类型

2. POST /api/annotation-types - 创建标注类型
   - 接收：AnnotationTypeCreate
   - 功能：添加自定义标注类型

3. PUT /api/annotation-types/{type_id} - 更新标注类型
   - 功能：修改类型的颜色、图标、优先级

4. DELETE /api/annotation-types/{type_id} - 删除标注类型

5. POST /api/annotation-types/init-defaults - 初始化默认类型
   - 功能：创建系统预设的标注类型（info/warning/suggestion/security）
```

**`quality.py`** - 质量评估 API
```python
路由前缀：/api/quality

接口列表：
1. GET /api/quality/file/{file_id} - 获取文件质量报告
   - 返回：QualityMetrics
   - 统计内容：
     * 代码总行数
     * 标注数量和密度
     * 各类型标注分布
     * 问题严重程度分析
   
2. GET /api/quality/project/{project_id} - 获取项目质量报告
   - 返回：QualityReport
   - 统计内容：
     * 项目整体质量评分
     * 所有文件的质量汇总
     * 标注趋势分析
     * 问题热点分布

实现逻辑：
- 使用 SQLAlchemy 聚合查询统计数据
- 计算标注密度（标注数/代码行数）
- 根据 warning/security 类型权重计算质量分
```

**`settings.py`** - 系统设置 API
```python
路由前缀：/api/settings

接口列表：
1. GET /api/settings - 获取所有设置
   - 返回：用户设置 JSON 对象
   - 来源：user_settings.json 文件

2. POST /api/settings - 保存设置
   - 接收：设置 JSON 对象
   - 功能：保存 LLM 配置、导出设置等到文件

3. POST /api/settings/llm/test - 测试 LLM 连接
   - 接收：LLM 配置参数
   - 功能：
     * 创建临时 LLMService 实例
     * 发送测试请求到 AI API
     * 验证连接和 API 密钥有效性
   - 返回：测试结果（成功/失败及错误信息）

4. GET /api/settings/export - 导出配置
   - 功能：导出系统配置为 JSON 文件

实现细节：
- 设置存储在 user_settings.json（持久化）
- 支持热加载配置（无需重启服务）
```

#### 5. 业务逻辑层 - services/

**`llm_service.py`** - LLM 服务（核心 AI 集成）
```python
类：LLMService

初始化参数：
- provider: LLM 提供商（openai/anthropic/ollama）
- model: 模型名称
- openai_api_key: OpenAI API 密钥
- openai_base_url: OpenAI API 地址（支持兼容接口如 DeepSeek）
- anthropic_api_key: Anthropic API 密钥

核心方法：

1. generate_line_annotations(code, language)
   - 功能：生成行内代码标注
   - 流程：
     * 构建 Prompt（_build_line_annotation_prompt）
     * 根据 provider 调用对应 API（OpenAI/Claude/Ollama）
     * 解析返回的 JSON 数据
     * 错误处理（_handle_llm_error）
   - 返回：{"annotations": [{"line": 5, "type": "info", "content": "..."}]}

2. generate_function_annotations(function_code, language, function_name)
   - 功能：生成函数文档标注
   - 流程：与行内标注类似
   - 返回：{"description": "...", "parameters": [...], "returns": {...}}

3. _call_ollama(prompt)
   - 功能：调用本地 Ollama API
   - 特殊处理：
     * 解析 Markdown 代码块中的 JSON
     * 处理连接错误（Ollama 未启动）
     * 120秒超时设置

4. _handle_llm_error(error)
   - 功能：错误分类和友好提示
   - 处理场景：
     * 超时错误
     * API 密钥无效（401）
     * 余额不足（429 insufficient_quota）
     * 速率限制（429 rate_limit）
   - 返回：结构化错误信息

5. _build_line_annotation_prompt(code, language)
   - 功能：构建行内标注 Prompt
   - Prompt 设计：
     * 角色定义：专业代码审查专家
     * 任务描述：为代码添加中文注释
     * 标注类型说明：info/warning/suggestion/security
     * 输出格式：严格 JSON
     * 质量要求：只标注重要的行（10-20%）

6. _build_function_annotation_prompt(function_code, language)
   - 功能：构建函数标注 Prompt
   - 要求：
     * 功能描述
     * 参数说明（名称、类型、用途）
     * 返回值说明
     * 使用示例

技术亮点：
- 支持三种 LLM 提供商无缝切换
- OpenAI 兼容接口支持（可用 DeepSeek 等）
- 180秒超时适配慢速 API
- 完善的错误处理和重试机制
- JSON 强制输出模式（response_format）
```

**`code_parser.py`** - 代码解析服务
```python
类：CodeParser

功能：解析代码文件，提取函数、类等结构信息

核心方法：

1. parse_code(code, language)
   - 功能：解析代码，提取函数和类
   - 支持语言：Python, JavaScript, TypeScript, Java, C++, Go等
   - 返回数据结构：
     {
       "success": True,
       "functions": [
         {
           "name": "function_name",
           "line_start": 10,
           "line_end": 25,
           "code": "def function_name():\n    ..."
         }
       ],
       "classes": [...]
     }

2. parse_python(code)
   - 使用 AST（抽象语法树）解析 Python 代码
   - 提取函数定义、类定义
   - 获取准确的行号范围

3. parse_javascript(code)
   - 使用正则表达式匹配函数声明
   - 支持：function xxx()、const xxx = ()、class xxx

4. parse_with_tree_sitter(code, language)
   - 使用 Tree-sitter 库进行精确解析
   - 支持多种语言的语法树解析
   - 提取函数签名和代码块

实现技术：
- Python: ast 标准库
- JavaScript/TypeScript: 正则表达式 + Tree-sitter（可选）
- 其他语言: Tree-sitter 解析器

使用场景：
- AI 生成函数标注前的代码分析
- 代码结构可视化
- 函数列表展示
```

**`file_service.py`** - 文件处理服务
```python
类：FileService

功能：文件上传、读取、保存等操作

核心方法：

1. save_uploaded_file(file, project_id)
   - 功能：保存上传的文件
   - 流程：
     * 验证文件类型
     * 创建项目上传目录
     * 保存物理文件
     * 读取文件内容
     * 创建数据库记录
   - 返回：File 对象

2. read_file_content(filepath)
   - 功能：读取文件内容（支持多种编码）
   - 编码尝试顺序：utf-8 → gbk → latin-1

3. detect_language(filename)
   - 功能：根据文件扩展名识别编程语言
   - 映射：.py→python, .js→javascript, .java→java等

4. get_file_size(filepath)
   - 功能：获取文件大小（字节）

5. delete_file(file_id, db)
   - 功能：删除文件（数据库记录和物理文件）

实现细节：
- 使用 pathlib 处理路径
- 异步 I/O（aiofiles）提高性能
- 自动创建上传目录
```

**`git_service.py`** - Git 集成服务（预留）
```python
类：GitService

功能：从 Git 仓库导入代码文件

核心方法：

1. clone_repository(repo_url, project_id)
   - 功能：克隆 Git 仓库
   - 使用库：gitpython

2. import_files_from_repo(repo_path, project_id)
   - 功能：遍历仓库文件并导入数据库
   - 过滤：只导入支持的代码文件

3. get_commit_info(repo_path)
   - 功能：获取提交历史信息

状态：预留接口，暂未完全实现
```

**`quality_service.py`** - 质量评估服务
```python
类：QualityService

功能：分析代码质量和标注质量

核心方法：

1. calculate_file_quality(file_id, db)
   - 功能：计算文件质量指标
   - 指标：
     * 代码行数
     * 标注覆盖率
     * 问题密度
     * 严重程度分布
   - 评分算法：
     * 基础分100
     * security 类型 -10 分
     * warning 类型 -5 分
     * 标注覆盖率加分

2. calculate_project_quality(project_id, db)
   - 功能：计算项目整体质量
   - 聚合所有文件的质量数据
   - 生成趋势图表数据

3. get_annotation_statistics(file_id, db)
   - 功能：统计标注分布
   - 返回：各类型标注的数量和占比

4. generate_quality_report(project_id, db)
   - 功能：生成完整质量报告（PDF/JSON）

实现技术：
- SQLAlchemy 聚合查询（GROUP BY, COUNT）
- 质量评分算法
- 数据可视化（返回图表数据）
```

---

## 前端架构

### frontend/src/ - 前端源码目录

#### 1. 应用入口

**`main.tsx`** - React 应用入口
```typescript
功能：
- 渲染 React 根组件
- 配置 React Router（BrowserRouter）
- 引入全局样式
- 挂载到 #root 元素

关键代码：
- ReactDOM.createRoot()
- <BrowserRouter><App /></BrowserRouter>
```

**`App.tsx`** - 根组件和路由配置
```typescript
功能：
- 定义应用整体布局（Layout）
- 配置路由表（Routes）
- 包含 Header、Sider、Content 三部分

路由配置：
- / → ProjectList（项目列表）
- /projects → ProjectList
- /annotation/:projectId → CodeAnnotation（代码标注）
- /review → AnnotationReview（标注审核）
- /quality → QualityAssessment（质量评估）
- /settings → Settings（系统设置）

布局结构：
<Layout>
  <Header />
  <Layout>
    <Sider />
    <Content>
      <Routes />  // 页面内容
    </Content>
  </Layout>
</Layout>
```

**`index.css`** / **`App.css`** - 全局样式
```css
功能：
- 定义全局样式变量
- 重置默认样式
- 响应式布局样式
- 主题色配置
```

#### 2. 布局组件 - components/Layout/

**`Header.tsx`** - 顶部导航栏
```typescript
功能：
- 显示应用标题和 Logo
- 显示当前用户信息（预留）
- 全局操作按钮（预留）

样式：
- 固定顶部
- 高度 64px
- 深色背景
```

**`Sider.tsx`** - 侧边栏菜单
```typescript
功能：
- 导航菜单（使用 Ant Design Menu）
- 路由跳转（useNavigate）
- 菜单项高亮显示当前页面

菜单项：
- 项目列表（ProjectOutlined）
- 代码标注（CodeOutlined）
- 标注审核（CheckCircleOutlined）
- 质量评估（BarChartOutlined）
- 系统设置（SettingOutlined）

技术：
- 使用 useLocation() 获取当前路由
- 根据路径自动高亮菜单项
```

#### 3. 功能组件 - components/

**`FileUpload/index.tsx`** - 文件上传组件
```typescript
Props:
- projectId: 项目 ID
- onSuccess: 上传成功回调

功能：
- 文件选择（input[type=file]）
- 文件类型验证
- 上传进度显示
- 拖拽上传（Ant Design Upload）
- 多文件上传支持

实现：
- 使用 FormData 封装文件
- 调用 fileService.uploadFile() API
- 上传成功后刷新文件列表
```

**`AnnotationTypeManager.tsx`** - 标注类型管理
```typescript
功能：
- 显示所有标注类型列表
- 添加自定义标注类型
- 编辑类型（颜色、图标、优先级）
- 删除类型
- 初始化默认类型

UI 组件：
- Table（列表展示）
- Modal（添加/编辑对话框）
- ColorPicker（颜色选择）
- Form（表单验证）

API 调用：
- annotationTypeService.getTypes()
- annotationTypeService.createType()
- annotationTypeService.updateType()
- annotationTypeService.deleteType()
```

**`ExportSettings.tsx`** - 导出设置组件
```typescript
功能：
- 选择导出格式（JSON/Markdown/PDF）
- 配置导出内容（是否包含代码、标注等）
- 预览导出结果
- 下载导出文件

导出格式：
- JSON: 结构化数据
- Markdown: 可读文档
- PDF: 打印友好格式（预留）

实现：
- 前端生成导出文件
- 使用 Blob 和 URL.createObjectURL 下载
```

**`QualityCharts.tsx`** - 质量图表组件
```typescript
功能：
- 显示质量评估图表
- 使用 ECharts 可视化数据

图表类型：
1. 饼图（Pie）: 标注类型分布
2. 柱状图（Bar）: 各文件标注数量
3. 折线图（Line）: 质量趋势
4. 雷达图（Radar）: 多维质量指标

数据来源：
- qualityService.getFileQuality()
- qualityService.getProjectQuality()

技术：
- echarts-for-react 库
- 响应式图表尺寸
- 交互式工具提示
```

#### 4. 页面组件 - pages/

**`ProjectList/index.tsx`** - 项目列表页
```typescript
功能：
- 显示所有项目（卡片或表格）
- 创建新项目（Modal 对话框）
- 编辑项目信息
- 删除项目（带确认）
- 归档项目
- 搜索和筛选项目
- 点击项目卡片进入标注页面

UI 布局：
- 顶部：搜索栏 + 新建按钮
- 主体：项目卡片网格（Grid）
- 每个卡片显示：
  * 项目名称
  * 描述
  * 文件数量
  * 标注数量
  * 创建时间
  * 操作按钮

状态管理：
- projects: 项目列表
- loading: 加载状态
- modalVisible: 对话框显示状态
- searchText: 搜索关键词

API 调用：
- projectService.getProjects()
- projectService.createProject()
- projectService.updateProject()
- projectService.deleteProject()
```

**`CodeAnnotation/index.tsx`** - 代码标注页（核心页面）
```typescript
功能：这是系统最复杂的页面，包含完整的标注工作流

布局结构（三栏式）：
1. 左侧边栏（Sider）：文件树
   - 显示项目所有文件
   - Tree 组件展示
   - 点击选择文件

2. 中间内容区（Content）：代码编辑器
   - Monaco Editor 显示代码
   - 行号点击添加标注
   - 代码高亮和语法检查
   - 可视化标注装饰器（Decorations）

3. 右侧边栏（Sider）：标注列表
   - 显示当前文件的所有标注
   - 点击跳转到对应代码行
   - 编辑、删除标注

状态管理：
- files: 文件列表
- selectedFile: 当前选中的文件
- annotations: 标注列表
- selectedLine: 选中的行号
- loading/generating: 加载状态
- editorRef: Monaco Editor 实例引用
- decorationsRef: 装饰器 ID 引用

核心功能实现：

1. Monaco Editor 集成
   - handleEditorMount(): 编辑器挂载时的初始化
   - 添加自定义 CSS 样式（不同颜色的行高亮）
   - 监听行号点击事件（onMouseDown）
   - 配置编辑器选项（只读、行号、折叠等）

2. 可视化装饰器（Decorations）
   - updateEditorDecorations(): 更新代码行装饰
   - 为标注的行添加背景色
   - 在行号旁边显示标记符号：
     * [i] - info（蓝色）
     * [!] - warning（黄色）
     * [*] - suggestion（绿色）
     * [#] - security（红色）
   - 鼠标悬停显示标注内容

3. 添加/编辑标注
   - handleLineClick(): 点击行号触发
   - 打开 Drawer 抽屉（右侧滑出）
   - Form 表单：
     * 标注类型选择（Select）
     * 标注内容输入（TextArea）
     * 代码预览（显示上下文）
   - handleSaveAnnotation(): 保存标注

4. AI 生成标注
   - handleGenerateAnnotations(): 触发 AI 生成
   - 显示加载状态（Spin）
   - 调用 annotationService.generateAnnotations()
   - 参数：
     * generate_line_annotations: true
     * generate_function_annotations: true
   - 生成成功后自动刷新标注列表

5. 标注列表展示
   - List 组件显示所有标注
   - 每个标注项显示：
     * 类型图标和颜色
     * 行号或函数名
     * 标注内容
     * 编辑/删除按钮
   - 点击标注项跳转到代码行（jumpToLine）

6. 带注释代码生成
   - generateAnnotatedCode(): 生成带注释的完整代码
   - 将标注插入代码作为注释
   - 支持不同语言的注释格式：
     * Python: # 注释
     * JavaScript/Java: // 注释
     * SQL: -- 注释
   - 函数标注生成文档注释：
     * Python: """文档"""
     * JavaScript: /** 文档 */
   - 显示在 Modal 中（可复制/下载）

7. 文件上传
   - 点击上传按钮打开 Modal
   - FileUpload 组件处理上传
   - 上传成功后刷新文件列表

组件间通信：
- useParams 获取路由参数（projectId）
- useEffect 监听文件选择和标注变化
- 父子组件通过 Props 传递回调函数

API 调用：
- fileService.getProjectFiles()
- fileService.uploadFile()
- annotationService.getAnnotations()
- annotationService.createAnnotation()
- annotationService.updateAnnotation()
- annotationService.deleteAnnotation()
- annotationService.generateAnnotations()

技术亮点：
- Monaco Editor 深度定制
- 实时可视化标注
- 响应式三栏布局
- 流畅的交互体验
```

**`AnnotationReview/index.tsx`** - 标注审核页
```typescript
功能：
- 显示所有待审核的标注
- 筛选功能（按文件、类型、状态）
- 批量审核操作
- 标注内容预览和编辑
- 审核通过/拒绝

UI 组件：
- Table（数据表格）
- Checkbox（批量选择）
- Button（批量操作按钮）
- Drawer（标注详情）
- Tag（状态标签）

审核流程：
1. 查看标注内容和上下文
2. 点击"通过"或"拒绝"按钮
3. 标注状态自动更新
4. 支持批量操作多个标注

API 调用：
- annotationService.getAnnotations({ status: 'pending' })
- annotationService.approveAnnotation()
- annotationService.rejectAnnotation()
- annotationService.updateAnnotation()

状态筛选：
- pending: 待审核（黄色）
- approved: 已通过（绿色）
- rejected: 已拒绝（红色）
```

**`QualityAssessment/index.tsx`** - 质量评估页
```typescript
功能：
- 显示项目整体质量报告
- 显示各文件质量详情
- 可视化图表展示
- 质量趋势分析
- 问题热点识别

页面布局：
1. 顶部：质量概览卡片
   - 总体评分
   - 文件数量
   - 标注数量
   - 问题数量

2. 中部：质量图表
   - QualityCharts 组件
   - 标注分布饼图
   - 文件质量对比柱状图
   - 质量趋势折线图

3. 底部：文件列表表格
   - 文件名
   - 质量评分
   - 标注数量
   - 问题数量
   - 操作按钮（查看详情）

质量计算：
- 基于标注数量和类型
- security 类型权重最高
- warning 类型次之
- 标注覆盖率加分

API 调用：
- qualityService.getProjectQuality()
- qualityService.getFileQuality()

数据展示：
- Statistic（统计数字）
- Progress（进度条）
- Chart（ECharts 图表）
- Table（数据表格）
```

**`Settings/index.tsx`** - 系统设置页
```typescript
功能：
- LLM API 配置
- 标注类型管理
- 导出设置
- 系统参数配置

页面结构（Tabs 标签页）：

Tab 1: LLM 配置
- 选择提供商（Select）：
  * OpenAI
  * Claude (Anthropic)
  * Ollama（本地）
- API 配置表单（Form）：
  * API Key（Input.Password）
  * Base URL（Input，支持自定义地址）
  * 模型选择（Select）
- 测试连接按钮
  * 调用 settingsService.testLLM()
  * 显示测试结果（成功/失败）
- 保存配置按钮

Tab 2: 标注类型管理
- AnnotationTypeManager 组件
- 显示所有标注类型
- 添加、编辑、删除类型

Tab 3: 导出设置
- ExportSettings 组件
- 配置导出格式和内容

Tab 4: 系统参数
- 上传文件大小限制
- 代码高亮主题选择
- 语言设置（预留）

配置保存：
- 保存到 backend/user_settings.json
- 立即生效（无需重启）

API 调用：
- settingsService.getSettings()
- settingsService.saveSettings()
- settingsService.testLLM()
```

#### 5. API 服务层 - services/

**`api.ts`** - Axios 实例配置
```typescript
功能：
- 创建 Axios 实例
- 配置 baseURL（http://localhost:8000）
- 设置默认 headers
- 添加请求拦截器（添加 token 等）
- 添加响应拦截器（统一错误处理）

错误处理：
- 401: 未授权，跳转登录
- 403: 无权限
- 404: 资源不存在
- 500: 服务器错误
- 网络错误: Network Error

导出：
- axios 实例供其他服务使用
```

**`projectService.ts`** - 项目 API 服务
```typescript
功能：封装所有项目相关的 API 调用

方法：
1. getProjects(params?)
   - GET /api/projects
   - 参数：skip, limit（分页）
   - 返回：Project[]

2. getProject(id)
   - GET /api/projects/{id}
   - 返回：Project

3. createProject(data)
   - POST /api/projects
   - 参数：{ name, description }
   - 返回：Project

4. updateProject(id, data)
   - PUT /api/projects/{id}
   - 返回：Project

5. deleteProject(id)
   - DELETE /api/projects/{id}

6. archiveProject(id)
   - POST /api/projects/{id}/archive

实现：
- 使用 api 实例发送请求
- 统一错误处理
- 返回 Promise
```

**`fileService.ts`** - 文件 API 服务
```typescript
方法：
1. getProjectFiles(projectId)
   - GET /api/files/project/{projectId}/list
   - 返回：File[]

2. getFile(id)
   - GET /api/files/{id}
   - 返回：File（包含完整代码内容）

3. uploadFile(file, projectId)
   - POST /api/files/upload
   - Content-Type: multipart/form-data
   - 使用 FormData 封装文件
   - 返回：File

4. updateFile(id, data)
   - PUT /api/files/{id}
   - 返回：File

5. deleteFile(id)
   - DELETE /api/files/{id}

特殊处理：
- 上传进度回调（onUploadProgress）
- 文件大小限制检查
```

**`annotationService.ts`** - 标注 API 服务
```typescript
方法：
1. getAnnotations(params?)
   - GET /api/annotations
   - 参数：file_id, annotation_type, status
   - 返回：Annotation[]

2. createAnnotation(data)
   - POST /api/annotations/
   - 参数：AnnotationCreate
   - 返回：Annotation

3. updateAnnotation(id, data)
   - PUT /api/annotations/{id}
   - 返回：Annotation

4. deleteAnnotation(id)
   - DELETE /api/annotations/{id}

5. approveAnnotation(id)
   - POST /api/annotations/{id}/approve

6. rejectAnnotation(id)
   - POST /api/annotations/{id}/reject

7. generateAnnotations(data)
   - POST /api/annotations/generate
   - 参数：
     * file_id
     * generate_line_annotations
     * generate_function_annotations
   - 返回：{ success, message, annotation_count }

核心方法：
- generateAnnotations 调用 AI 生成标注
```

**`annotationTypeService.ts`** - 标注类型 API 服务
```typescript
方法：
1. getTypes()
   - GET /api/annotation-types
   - 返回：AnnotationType[]

2. createType(data)
   - POST /api/annotation-types
   - 返回：AnnotationType

3. updateType(id, data)
   - PUT /api/annotation-types/{id}

4. deleteType(id)
   - DELETE /api/annotation-types/{id}

5. initDefaultTypes()
   - POST /api/annotation-types/init-defaults
   - 初始化系统默认类型
```

**`qualityService.ts`** - 质量评估 API 服务
```typescript
方法：
1. getFileQuality(fileId)
   - GET /api/quality/file/{fileId}
   - 返回：QualityMetrics

2. getProjectQuality(projectId)
   - GET /api/quality/project/{projectId}
   - 返回：QualityReport

返回数据结构：
- quality_score: 质量评分（0-100）
- total_lines: 代码总行数
- annotation_count: 标注数量
- annotation_density: 标注密度
- type_distribution: 类型分布
- severity_distribution: 严重程度分布
```

#### 6. 类型定义 - types/

**`index.ts`** - TypeScript 类型定义
```typescript
功能：定义所有数据模型的 TypeScript 接口

主要类型：

interface Project {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at?: string
  is_archived: boolean
  file_count?: number
  annotation_count?: number
}

interface File {
  id: number
  project_id: number
  filename: string
  filepath: string
  content: string
  language: string
  size: number
  created_at: string
  updated_at?: string
  annotation_count?: number
}

interface Annotation {
  id: number
  file_id: number
  type: 'line' | 'function'
  line_number?: number
  line_end?: number
  function_name?: string
  content: string
  annotation_type: 'info' | 'warning' | 'suggestion' | 'security'
  status: 'pending' | 'approved' | 'rejected'
  color?: string
  created_at: string
  updated_at?: string
}

interface AnnotationType {
  id: number
  name: string
  color: string
  icon?: string
  priority: number
  created_at: string
  updated_at?: string
}

interface QualityMetrics {
  quality_score: number
  total_lines: number
  annotation_count: number
  annotation_density: number
  type_distribution: Record<string, number>
  severity_distribution: Record<string, number>
}

作用：
- 提供类型检查和 IDE 智能提示
- 确保前后端数据结构一致
- 减少运行时错误
```

---

## 数据流转

### 完整的标注生成流程

```
用户操作：点击"生成标注"按钮
    ↓
前端 CodeAnnotation 组件：
    - handleGenerateAnnotations() 方法
    - 设置 generating = true（显示加载动画）
    ↓
前端 annotationService：
    - generateAnnotations({ file_id, ... })
    - 使用 axios POST 请求
    ↓
HTTP 请求：POST http://localhost:8000/api/annotations/generate
    - Content-Type: application/json
    - Body: { file_id: 1, generate_line_annotations: true, ... }
    ↓
后端 FastAPI：
    - 路由匹配到 annotations.py 的 generate_annotations()
    - 依赖注入：Depends(get_db) 获取数据库会话
    ↓
后端 API 处理：
    1. 查询数据库获取文件内容
       - db.query(File).filter(File.id == file_id).first()
    2. 加载用户设置
       - _load_user_settings() 读取 user_settings.json
       - 获取 llmProvider, llmModel, apiKey 等配置
    3. 创建 LLM 服务实例
       - llm_service = get_llm_service(provider, model, api_key, ...)
    ↓
后端 LLM Service：
    1. 构建 Prompt
       - _build_line_annotation_prompt(code, language)
       - 包含角色定义、任务说明、输出格式
    2. 调用 AI API
       - OpenAI: openai_client.chat.completions.create()
       - Claude: anthropic_client.messages.create()
       - Ollama: requests.post(ollama_url)
    ↓
AI 模型处理：
    - 分析代码结构
    - 识别重要代码行
    - 生成中文标注
    - 返回 JSON 格式结果
    ↓
AI 返回结果：
{
  "annotations": [
    { "line": 5, "type": "info", "content": "初始化数据库连接" },
    { "line": 12, "type": "warning", "content": "缺少输入验证" }
  ]
}
    ↓
后端解析和保存：
    - json.loads(result) 解析 JSON
    - 遍历 annotations 数组
    - 为每个标注创建 Annotation 对象
    - 设置 file_id, type, line_number, content 等字段
    - db.add(annotation) 添加到数据库
    - db.commit() 提交事务
    ↓
后端返回响应：
{
  "success": true,
  "message": "成功生成15条标注",
  "annotation_count": 15
}
    ↓
前端接收响应：
    - 设置 generating = false（隐藏加载动画）
    - message.success("标注生成成功")
    - 调用 loadAnnotations() 刷新标注列表
    ↓
前端重新渲染：
    - 从数据库加载标注
    - GET /api/annotations?file_id=1
    - 更新 annotations 状态
    - 触发 useEffect
    - 调用 updateEditorDecorations()
    ↓
Monaco Editor 更新：
    - 为标注的行添加背景色
    - 在行号旁边显示标记符号
    - 鼠标悬停显示标注内容
    ↓
用户看到结果：代码行被高亮，标注显示在右侧列表
```

### 手动添加标注流程

```
用户操作：点击代码行号
    ↓
Monaco Editor 事件：
    - onMouseDown 事件触发
    - 判断点击类型：GUTTER_LINE_NUMBERS
    - 获取行号：e.target.position?.lineNumber
    ↓
前端组件处理：
    - handleLineClick(lineNumber)
    - 检查是否已有标注
    - 设置 selectedLine = lineNumber
    - 打开 Drawer：setAnnotationDrawerVisible(true)
    ↓
用户填写表单：
    - 选择标注类型（info/warning/suggestion/security）
    - 输入标注内容
    - 显示代码预览（上下文）
    ↓
用户点击保存：
    - form.submit() 触发 onFinish
    - handleSaveAnnotation(values)
    ↓
前端发送请求：
    - annotationService.createAnnotation({
        file_id,
        type: 'line',
        line_number,
        content,
        annotation_type,
        color
      })
    - POST /api/annotations/
    ↓
后端处理：
    - annotations.py 的 create_annotation()
    - 验证文件是否存在
    - 创建 Annotation 对象
    - 保存到数据库
    - 返回 AnnotationResponse
    ↓
前端更新：
    - 关闭 Drawer
    - message.success("标注已添加")
    - loadAnnotations() 刷新列表
    - updateEditorDecorations() 更新装饰器
    ↓
UI 更新：新标注显示在列表和编辑器中
```

---

## 部署脚本

### Windows 批处理脚本

**`install.bat`** - 一键安装脚本
```batch
功能：
1. 检查 Python 和 Node.js 是否安装
2. 安装后端依赖
   - cd backend
   - python -m venv venv
   - venv\Scripts\activate
   - pip install -r requirements.txt
3. 安装前端依赖
   - cd frontend
   - npm install
4. 显示安装成功提示

技术：
- 使用 where 命令检查程序是否存在
- errorlevel 判断命令执行结果
- 彩色输出提示信息
```

**`start-all.bat`** - 启动所有服务
```batch
功能：
1. 启动后端服务（新窗口）
   - start cmd /k start-backend.bat
2. 等待 3 秒（让后端先启动）
3. 启动前端服务（新窗口）
   - start cmd /k start-frontend.bat
4. 显示访问地址

特点：
- 使用 start cmd /k 打开新窗口
- /k 参数保持窗口打开
- 窗口标题显示服务名称
```

**`start-backend.bat`** - 启动后端
```batch
功能：
1. 切换到 backend 目录
2. 激活虚拟环境
3. 启动 uvicorn 服务
   - uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
4. 显示 API 文档地址

参数说明：
- --reload: 代码改动自动重启
- --host 0.0.0.0: 允许外部访问
- --port 8000: 监听 8000 端口
```

**`start-frontend.bat`** - 启动前端
```batch
功能：
1. 切换到 frontend 目录
2. 启动 Vite 开发服务器
   - npm run dev
3. 显示访问地址（http://localhost:5173）

技术：
- Vite 提供热模块替换（HMR）
- 快速启动和构建
```

**`stop-all.bat`** - 停止所有服务
```batch
功能：
1. 查找并终止后端进程
   - taskkill /F /IM python.exe /FI "WINDOWTITLE eq CodeAnnotator Backend"
2. 查找并终止前端进程
   - taskkill /F /IM node.exe /FI "WINDOWTITLE eq CodeAnnotator Frontend"
3. 显示停止成功提示

参数说明：
- /F: 强制终止
- /IM: 按镜像名（进程名）
- /FI: 过滤条件（窗口标题）
```

**`fix-database.bat`** - 数据库修复工具
```batch
功能：
1. 运行数据库检查和修复脚本
   - python backend/check_and_fix_db.py
2. 重新初始化数据表
3. 创建默认标注类型

使用场景：
- 数据库损坏
- 表结构不匹配
- 缺少默认数据
```

**`quick-fix.bat`** - 快速修复工具
```batch
功能：
1. 停止所有服务
2. 修复数据库
3. 清理临时文件
4. 重新安装依赖（可选）
5. 重启服务

使用场景：
- 系统出现异常
- 快速恢复正常状态
```

### PowerShell 脚本

**`install.ps1`** / **`start-all.ps1`** / **`stop-all.ps1`**
```powershell
功能：与批处理脚本相同，但使用 PowerShell 语法

优势：
- 更强大的脚本能力
- 更好的错误处理
- 跨平台兼容（Windows/Linux/Mac）
- 支持更复杂的逻辑

使用：
- PowerShell 中运行：.\install.ps1
- 可能需要设置执行策略：Set-ExecutionPolicy RemoteSigned
```

---

## 关键技术点总结

### 1. **数据库设计**
- 使用 SQLAlchemy ORM
- 关系映射：Project → File → Annotation
- 外键约束确保数据完整性
- 时间戳自动更新（created_at, updated_at）

### 2. **API 设计**
- RESTful 风格
- 统一的响应格式
- Pydantic 数据验证
- 自动生成 OpenAPI 文档（/docs）

### 3. **AI 集成**
- 支持多个 LLM 提供商
- 动态配置切换
- Prompt 工程优化
- 错误处理和重试机制

### 4. **前端架构**
- 组件化设计（React）
- 类型安全（TypeScript）
- 响应式布局（Ant Design）
- Monaco Editor 深度集成

### 5. **代码编辑器**
- VS Code 级别的编辑体验
- 自定义装饰器（Decorations）
- 语法高亮和代码折叠
- 可视化标注展示

### 6. **用户体验**
- 一键安装和启动
- 实时反馈和加载状态
- 友好的错误提示
- 完善的帮助文档

### 7. **性能优化**
- 异步 I/O（aiofiles）
- 数据库查询优化（索引）
- 前端按需加载
- 图片和资源压缩

### 8. **安全性**
- API 密钥加密存储
- CORS 跨域控制
- 输入验证和过滤
- SQL 注入防护（ORM）

---

## 开发建议

### 扩展功能建议

1. **用户认证系统**
   - 添加登录/注册功能
   - JWT Token 认证
   - 权限管理（admin/user）

2. **协作功能**
   - 多人同时标注
   - 标注评论和讨论
   - 变更历史追踪

3. **Git 深度集成**
   - 完善 git_service.py
   - 支持 Git diff 标注
   - 提交历史分析

4. **更多 AI 功能**
   - 代码漏洞检测
   - 性能优化建议
   - 代码重构建议

5. **导出增强**
   - PDF 格式导出
   - Markdown 文档生成
   - 代码审查报告

6. **数据库升级**
   - 支持 PostgreSQL/MySQL
   - 数据备份和恢复
   - 数据库迁移工具（Alembic）

### 代码质量改进

1. **测试覆盖**
   - 后端单元测试（pytest）
   - 前端单元测试（Jest）
   - 集成测试
   - E2E 测试（Playwright）

2. **代码规范**
   - ESLint + Prettier（前端）
   - Black + Flake8（后端）
   - pre-commit hooks

3. **文档完善**
   - API 文档详细说明
   - 组件使用示例
   - 开发者指南

4. **性能监控**
   - 添加日志系统
   - API 性能监控
   - 错误追踪（Sentry）

---

## 总结

CodeAnnotator 是一个功能完整、架构清晰的代码标注系统：

- **后端**：FastAPI + SQLAlchemy 提供稳定的 API 服务，集成多个 LLM 提供商实现 AI 智能标注
- **前端**：React + TypeScript + Ant Design 提供现代化的用户界面，Monaco Editor 提供专业级代码编辑体验
- **数据流**：前后端通过 RESTful API 通信，数据存储在 SQLite 数据库，配置保存在 JSON 文件
- **部署**：提供完善的一键安装和启动脚本，极大降低使用门槛

整个系统设计合理、模块化良好、易于扩展和维护。

