@echo off
chcp 65001 >nul
echo ========================================
echo  日常生活记录系统 - 一键启动脚本
echo ========================================
echo.

cd /d "%~dp0"

:: Step 1: Build the project
echo [1/3] 构建后端项目...
cd backend
if not exist "%JAVA_HOME%" (
    echo 错误: 未找到 JAVA_HOME 环境变量
    echo 请确保已安装 JDK 17 并设置 JAVA_HOME
    pause
    exit /b 1
)
call mvnw.cmd clean package -DskipTests
if errorlevel 1 (
    echo 构建失败，请检查错误信息
    pause
    exit /b 1
)
echo 构建成功！

:: Step 2: Start the backend
echo.
echo [2/3] 启动后端服务 (端口 8080)...
start "LifeRecord-Backend" "%JAVA_HOME%\bin\java.exe" -jar target\life-record-1.0.0.jar

:: Wait for backend to start
echo 等待后端启动...
timeout /t 8 /nobreak >nul

:: Step 3: Open the frontend
echo.
echo [3/3] 打开前端页面...
start "" "..\frontend\index.html"

echo.
echo ========================================
echo  系统已启动！
echo  后端地址: http://localhost:8080
echo  前端页面: %~dp0..\frontend\index.html
echo  H2控制台: http://localhost:8080/h2-console
echo  默认账号: admin / 123456
echo ========================================
echo.
echo 按任意键关闭此窗口...
pause >nul
