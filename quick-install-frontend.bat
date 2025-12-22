@echo off
chcp 65001 >nul
echo ====================================
echo   快速安装前端依赖
echo ====================================
echo.

cd frontend

echo 安装 npm 依赖...
echo 提示: 这可能需要几分钟，请耐心等待...
echo.

call npm install

if errorlevel 1 (
    echo.
    echo ❌ 安装失败，尝试使用国内镜像...
    call npm install --registry=https://registry.npmmirror.com
    if errorlevel 1 (
        echo ❌ 仍然失败，请检查网络连接
        pause
        exit /b 1
    )
)

echo.
echo ✓ 前端依赖安装完成！
echo.
cd ..

pause











