# 智能客服系统快速启动指南

## 前置要求

1. **Node.js** (版本 16+)
2. **MongoDB** (本地或远程)
3. **Ollama** (已安装并下载deepseek:r1:7b模型)

## 快速启动

### 1. 启动Ollama服务
```bash
# 启动Ollama服务
ollama serve

# 下载模型（如果还没有）
ollama pull deepseek:r1:7b
```

### 2. 启动后端服务
```bash
cd project-node
npm install
npm start
```

### 3. 启动前端服务
```bash
cd project
npm install
npm run dev
```

### 4. 测试系统
访问以下地址测试：
- 前端: http://localhost:5173
- 测试页面: http://localhost:5173/customer-service-test
- 智能客服: http://localhost:5173/ai-customer-service

## 故障排除

### 1. 404错误
如果遇到404错误，请检查：
- 后端服务是否在端口3000运行
- 前端代理配置是否正确
- 重启前端服务：`npm run dev`

### 2. 数据库连接错误
确保MongoDB服务正在运行，检查连接字符串

### 3. Ollama连接错误
确保Ollama服务正在运行：
```bash
curl http://localhost:11434/api/tags
```

### 4. 端口冲突
如果端口被占用，可以修改：
- 后端端口：修改 `project-node/bin/www`
- 前端端口：修改 `project/vite.config.ts`

## 测试命令

### 测试后端API
```bash
cd project-node
node test-server.js
```

### 测试Ollama连接
```bash
# 方法1: 使用curl
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-r1:7b",
    "messages": [{"role": "user", "content": "你好"}],
    "stream": false
  }'

# 方法2: 使用Node.js测试脚本
cd project-node
node test-fix.js
```

## 常见问题

### Q: 前端显示"网络请求失败"
A: 检查后端服务是否启动，确保端口3000可访问

### Q: AI回复很慢或没有响应
A: 检查Ollama服务状态，确认模型已下载

### Q: 聊天历史不保存
A: 检查MongoDB连接，确保数据库服务正常

### Q: 代理配置不生效
A: 重启前端开发服务器：`npm run dev`

### Q: Ollama返回400错误
A: 检查模型是否正确下载，运行：`ollama list`

### Q: 流式响应不工作
A: 检查Ollama版本，确保支持流式响应 