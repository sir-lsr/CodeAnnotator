@echo off
chcp 65001 >nul
echo ====================================
echo   启动前端开发服务器
echo ====================================
echo.

cd frontend

echo 检查依赖...
if not exist "node_modules" (
    echo 正在安装前端依赖...
    call npm install
    if errorlevel 1 (
        echo 依赖安装失败！
        pause
        exit /b 1
    )
)

echo.
echo 启动前端服务器...
echo 访问地址: http://localhost:5173
echo.
call npm run dev

pause











