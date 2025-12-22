# PowerShell 停止所有服务脚本
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  停止所有服务" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "正在查找并关闭 Node.js 进程（前端）..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "✓ 前端服务已停止" -ForegroundColor Green
} else {
    Write-Host "- 前端服务未运行" -ForegroundColor Gray
}

Write-Host ""
Write-Host "正在查找并关闭 Python/Uvicorn 进程（后端）..." -ForegroundColor Yellow
$pythonProcesses = Get-Process -Name python -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    # 查找监听8000端口的进程
    $connections = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
    Write-Host "✓ 后端服务已停止" -ForegroundColor Green
} else {
    Write-Host "- 后端服务未运行" -ForegroundColor Gray
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "  所有服务已停止" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Read-Host "按回车键退出"











