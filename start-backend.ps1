# PowerShell 启动后端脚本
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  启动后端开发服务器" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path "backend"

Write-Host "检查虚拟环境..." -ForegroundColor Yellow
if (-not (Test-Path "venv")) {
    Write-Host "创建虚拟环境..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "虚拟环境创建失败！" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
}

Write-Host "激活虚拟环境..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

Write-Host "检查依赖..." -ForegroundColor Yellow
$fastapi = pip show fastapi 2>$null
if (-not $fastapi) {
    Write-Host "正在安装后端依赖..." -ForegroundColor Yellow
    pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "依赖安装失败！" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
}

Write-Host ""
Write-Host "启动后端服务器..." -ForegroundColor Green
Write-Host "API地址: http://localhost:8000" -ForegroundColor Green
Write-Host "API文档: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Read-Host "按回车键退出"

