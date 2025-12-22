@echo off
chcp 65001 >nul
echo ====================================
echo   CodeAnnotator 一键安装
echo ====================================
echo.

echo [1/4] 检查环境...
echo.

REM 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✓ Node.js !NODE_VERSION!
)

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到 Python
    echo 请先安装 Python: https://www.python.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo ✓ !PYTHON_VERSION!
)

echo.
echo [2/4] 安装后端依赖...
echo.

cd backend

if not exist "venv" (
    echo 创建 Python 虚拟环境...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ 虚拟环境创建失败
        cd ..
        pause
        exit /b 1
    )
)

call venv\Scripts\activate.bat

echo 升级 pip...
python -m pip install --upgrade pip

echo 安装 Python 包...
pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo ❌ Python 依赖安装失败
    echo 正在尝试使用官方源重新安装...
    pip install -r requirements.txt --index-url https://pypi.org/simple
    if errorlevel 1 (
        echo ❌ 仍然失败，请检查网络连接
        cd ..
        pause
        exit /b 1
    )
)

echo ✓ 后端依赖安装完成

cd ..

echo.
echo [3/4] 安装前端依赖...
echo.

cd frontend

echo 安装 npm 包（可能需要几分钟）...
call npm install
if errorlevel 1 (
    echo ❌ npm 依赖安装失败
    cd ..
    pause
    exit /b 1
)

echo ✓ 前端依赖安装完成

cd ..

echo.
echo [4/4] 检查配置...
echo.

if not exist "backend\.env" (
    echo ⚠ 警告: 未找到 .env 配置文件
    echo 请运行 configure_llm.bat 配置 LLM API
) else (
    echo ✓ 配置文件已存在
)

echo.
echo ====================================
echo   ✅ 安装完成！
echo ====================================
echo.
echo 下一步:
echo 1. 双击 start-all.bat 启动服务
echo 2. 访问 http://localhost:5173
echo.
echo 提示: 如需配置 LLM API，请运行 configure_llm.bat
echo.
pause

