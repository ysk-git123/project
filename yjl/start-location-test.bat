@echo off
echo 启动定位功能测试服务...

echo.
echo 1. 启动后端服务 (端口 3001)...
cd project-node
start "Backend Server" cmd /k "npm start"

echo.
echo 2. 等待后端服务启动...
timeout /t 3 /nobreak > nul

echo.
echo 3. 启动前端服务 (端口 5173)...
cd ..\project
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 4. 等待前端服务启动...
timeout /t 5 /nobreak > nul

echo.
echo 服务启动完成！
echo.
echo 测试页面地址：
echo - 定位功能测试页面: http://localhost:3001/location-test.html
echo - React应用: http://localhost:5173
echo.
echo 按任意键打开测试页面...
pause > nul
start http://localhost:3001/location-test.html

echo.
echo 提示：
echo - 后端服务运行在: http://localhost:3001
echo - 前端服务运行在: http://localhost:5173
echo - 测试页面: http://localhost:3001/location-test.html
echo.
echo 按 Ctrl+C 停止所有服务
pause 