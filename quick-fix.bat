@echo off
chcp 65001 >nul
echo ====================================
echo   一键修复工具
echo ====================================
echo.
echo 此工具将：
echo 1. 停止所有服务
echo 2. 检查并修复数据库
echo 3. 重启后端服务
echo.
pause

echo.
echo [1/3] 停止所有服务...
call stop-all.bat

echo.
echo [2/3] 修复数据库...
cd backend
call venv\Scripts\activate.bat
python check_and_fix_db.py
if %errorlevel% neq 0 (
    echo.
    echo ✗ 数据库修复失败！
    pause
    exit /b 1
)
cd ..

echo.
echo [3/3] 重启后端服务...
start "后端服务器" cmd /k start-backend.bat

timeout /t 3 /nobreak >nul

echo.
echo ====================================
echo   修复完成！
echo ====================================
echo.
echo 后端服务器已在新窗口启动
echo 前端可以继续使用之前的服务
echo.
echo 如果问题仍然存在，请：
echo 1. 查看后端服务器日志（新打开的窗口）
echo 2. 运行诊断工具：check-services.bat
echo 3. 查看故障排除指南.md
echo.
pause

