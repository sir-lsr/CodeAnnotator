@echo off
chcp 65001 >nul
echo ====================================
echo   快速安装后端依赖
echo ====================================
echo.

cd backend

echo [1/3] 创建虚拟环境...
if not exist "venv" (
    python -m venv venv
)
echo ✓ 完成

echo.
echo [2/3] 升级 pip...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip -q
echo ✓ 完成

echo.
echo [3/3] 安装依赖包...
echo 提示: 这可能需要几分钟，请耐心等待...
echo.

pip install fastapi uvicorn[standard] sqlalchemy pydantic pydantic-settings python-multipart openai anthropic gitpython python-jose[cryptography] passlib[bcrypt] aiofiles

if errorlevel 1 (
    echo.
    echo ❌ 安装失败，请检查错误信息
    pause
    exit /b 1
)

echo.
echo ✓ 所有依赖安装完成！
echo.
cd ..

pause

