# PowerShell 启动全部服务脚本
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  启动完整开发环境" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "正在启动前端和后端服务器..." -ForegroundColor Yellow
Write-Host ""

# 启动后端
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '.\start-backend.ps1'"

# 等待3秒
Start-Sleep -Seconds 3

# 启动前端
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '.\start-frontend.ps1'"

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "  服务启动完成！" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "前端地址: http://localhost:5173" -ForegroundColor Green
Write-Host "后端地址: http://localhost:8000" -ForegroundColor Green
Write-Host "API文档:  http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "已在新窗口中启动前端和后端服务器" -ForegroundColor Cyan
Write-Host ""
Read-Host "按回车键关闭此窗口"

