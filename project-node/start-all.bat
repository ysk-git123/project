@echo off
echo 启动智能客服系统...

echo.
echo 1. 检查Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js未安装或未配置到PATH
    pause
    exit /b 1
)

echo.
echo 2. 检查MongoDB连接...
echo 请确保MongoDB服务正在运行

echo.
echo 3. 检查Ollama服务...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Ollama服务未运行，请先启动Ollama
    echo 运行命令: ollama serve
    echo.
)

echo.
echo 4. 安装依赖...
npm install

echo.
echo 5. 启动后端服务...
echo 后端服务将在 http://localhost:3000 启动
echo 按 Ctrl+C 停止服务
echo.
npm start 