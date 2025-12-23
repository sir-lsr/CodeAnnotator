@echo off
chcp 65001 >nul
echo ====================================
echo   启动后端开发服务器
echo ====================================
echo.

cd backend

echo 检查虚拟环境...
if not exist "venv" (
    echo 创建虚拟环境...
    python -m venv venv
    if errorlevel 1 (
        echo 虚拟环境创建失败！
        pause
        exit /b 1
    )
)

echo 激活虚拟环境...
call venv\Scripts\activate.bat

echo 检查依赖...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo 正在安装后端依赖...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo 依赖安装失败！
        pause
        exit /b 1
    )
)

echo.
echo 启动后端服务器...
echo API地址: http://localhost:8000
echo API文档: http://localhost:8000/docs
echo.
venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause











