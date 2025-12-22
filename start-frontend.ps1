# PowerShell 启动前端脚本
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  启动前端开发服务器" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path "frontend"

Write-Host "检查依赖..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "正在安装前端依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "依赖安装失败！" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
}

Write-Host ""
Write-Host "启动前端服务器..." -ForegroundColor Green
Write-Host "访问地址: http://localhost:5173" -ForegroundColor Green
Write-Host ""
npm run dev

Read-Host "按回车键退出"

