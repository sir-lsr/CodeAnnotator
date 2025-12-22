# PowerShell 安装和配置脚本
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  CodeAnnotator 安装配置向导" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 未找到 Node.js！" -ForegroundColor Red
    Write-Host "  请从 https://nodejs.org/ 下载并安装" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

# 检查 Python
Write-Host "检查 Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✓ Python 已安装: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 未找到 Python！" -ForegroundColor Red
    Write-Host "  请从 https://www.python.org/ 下载并安装" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  安装前端依赖" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path "frontend"

if (Test-Path "node_modules") {
    Write-Host "前端依赖已存在，跳过安装" -ForegroundColor Gray
} else {
    Write-Host "正在安装前端依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ 前端依赖安装失败！" -ForegroundColor Red
        Set-Location -Path ".."
        Read-Host "按回车键退出"
        exit 1
    }
    Write-Host "✓ 前端依赖安装成功" -ForegroundColor Green
}

Set-Location -Path ".."

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  安装后端依赖" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path "backend"

# 创建虚拟环境
if (Test-Path "venv") {
    Write-Host "虚拟环境已存在，跳过创建" -ForegroundColor Gray
} else {
    Write-Host "创建虚拟环境..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ 虚拟环境创建失败！" -ForegroundColor Red
        Set-Location -Path ".."
        Read-Host "按回车键退出"
        exit 1
    }
    Write-Host "✓ 虚拟环境创建成功" -ForegroundColor Green
}

# 激活虚拟环境
Write-Host "激活虚拟环境..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# 安装依赖
Write-Host "正在安装后端依赖..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 后端依赖安装失败！" -ForegroundColor Red
    Set-Location -Path ".."
    Read-Host "按回车键退出"
    exit 1
}
Write-Host "✓ 后端依赖安装成功" -ForegroundColor Green

Set-Location -Path ".."

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  检查配置文件" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path "backend\.env") {
    Write-Host "✓ 配置文件已存在" -ForegroundColor Green
    Write-Host ""
    Write-Host "当前配置:" -ForegroundColor Cyan
    Get-Content "backend\.env" | Select-String -Pattern "OPENAI_API_KEY|DEFAULT_MODEL|DEFAULT_LLM_PROVIDER" | ForEach-Object {
        $line = $_.Line
        if ($line -match "OPENAI_API_KEY=(.+)") {
            $key = $matches[1]
            if ($key -and $key -ne "your-openai-api-key-here") {
                Write-Host "  OPENAI_API_KEY: $($key.Substring(0, 12))..." -ForegroundColor Green
            } else {
                Write-Host "  OPENAI_API_KEY: 未配置" -ForegroundColor Red
            }
        } else {
            Write-Host "  $line" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "! 配置文件不存在" -ForegroundColor Yellow
    Write-Host "  使用示例配置创建 .env 文件" -ForegroundColor Yellow
    if (Test-Path "backend\env.example") {
        Copy-Item "backend\env.example" "backend\.env"
        Write-Host "✓ 已创建配置文件，请编辑 backend\.env 添加 API 密钥" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "  安装完成！" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 配置 API 密钥（如果还没配置）:" -ForegroundColor Yellow
Write-Host "   - 编辑 backend\.env 文件" -ForegroundColor Gray
Write-Host "   - 设置 OPENAI_API_KEY=your-api-key" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 启动应用:" -ForegroundColor Yellow
Write-Host "   - 一键启动: 双击 start-all.bat 或 start-all.ps1" -ForegroundColor Gray
Write-Host "   - 分别启动: start-frontend.bat 和 start-backend.bat" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 访问应用:" -ForegroundColor Yellow
Write-Host "   - 前端: http://localhost:5173" -ForegroundColor Gray
Write-Host "   - 后端: http://localhost:8000" -ForegroundColor Gray
Write-Host "   - API文档: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host ""
Read-Host "按回车键退出"











