@echo off
chcp 65001 >nul
echo ====================================
echo   启动完整开发环境
echo ====================================
echo.
echo 正在启动前端和后端服务器...
echo.

start "CodeAnnotator - Backend" cmd /k "start-backend.bat"
timeout /t 3 /nobreak >nul
start "CodeAnnotator - Frontend" cmd /k "start-frontend.bat"

echo.
echo ====================================
echo   服务启动完成！
echo ====================================
echo.
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:8000
echo API文档:  http://localhost:8000/docs
echo.
echo 按任意键关闭此窗口...
pause >nul

