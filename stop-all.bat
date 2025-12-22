@echo off
chcp 65001 >nul
echo ====================================
echo   停止所有服务
echo ====================================
echo.

echo 正在查找并关闭 Node.js 进程（前端）...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    taskkill /F /IM node.exe /T >NUL 2>&1
    echo ✓ 前端服务已停止
) else (
    echo - 前端服务未运行
)

echo.
echo 正在查找并关闭 Python/Uvicorn 进程（后端）...
tasklist /FI "IMAGENAME eq python.exe" 2>NUL | find /I /N "python.exe">NUL
if "%ERRORLEVEL%"=="0" (
    for /f "tokens=2" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
        taskkill /F /PID %%a >NUL 2>&1
    )
    echo ✓ 后端服务已停止
) else (
    echo - 后端服务未运行
)

echo.
echo ====================================
echo   所有服务已停止
echo ====================================
echo.
pause











