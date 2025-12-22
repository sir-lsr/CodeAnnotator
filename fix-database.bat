@echo off
chcp 65001 >nul
echo ====================================
echo   数据库修复工具
echo ====================================
echo.

cd backend

echo 激活虚拟环境...
call venv\Scripts\activate.bat

echo.
echo 运行数据库检查和修复...
python check_and_fix_db.py

echo.
echo ====================================
echo   修复完成
echo ====================================
echo.
echo 请重启后端服务器使更改生效
echo.
pause

