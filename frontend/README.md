# CodeAnnotator Frontend

代码标注系统前端应用

## 技术栈

- React 18
- TypeScript
- Vite
- Ant Design
- Monaco Editor
- React Router
- Axios
- Zustand

## 安装依赖

```bash
npm install
```

## 开发运行

```bash
npm run dev
```

访问: http://localhost:5173

## 构建

```bash
npm run build
```

## 项目结构

```
frontend/
├── src/
│   ├── components/         # 可复用组件
│   │   ├── Layout/        # 布局组件
│   │   └── FileUpload/    # 文件上传组件
│   ├── pages/             # 页面组件
│   │   ├── ProjectList/   # 项目列表
│   │   ├── CodeAnnotation/# 代码标注
│   │   ├── AnnotationReview/# 标注审核
│   │   └── Settings/      # 系统设置
│   ├── services/          # API服务
│   ├── types/             # TypeScript类型
│   ├── App.tsx           # 主应用组件
│   └── main.tsx          # 入口文件
├── index.html
├── package.json
└── vite.config.ts
```

## 功能说明

### 项目列表
- 创建新项目
- 查看项目列表
- 归档/删除项目

### 代码标注
- 上传代码文件
- Git仓库导入
- 自动生成标注
- 查看和编辑标注

### 标注审核
- 查看所有标注
- 审核通过/拒绝
- 按状态筛选

### 系统设置
- LLM API配置
- 标注类型管理

## 注意事项

1. 确保后端服务运行在 http://localhost:8000
2. Monaco Editor需要较大的网络资源，首次加载可能较慢
3. 支持的浏览器：Chrome、Edge、Firefox最新版本











