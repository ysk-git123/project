# 智能客服系统使用说明

## 概述

这是一个基于Ollama deepseek:r1:7b模型的智能客服系统，支持流式响应和聊天历史存储。

## 功能特性

- ✅ **流式响应** - 实时显示AI回复，提供更好的用户体验
- ✅ **聊天历史存储** - 自动保存对话记录到MongoDB数据库
- ✅ **多会话管理** - 支持多个聊天会话，可以切换不同的对话
- ✅ **美观界面** - 现代化聊天界面设计，支持移动端
- ✅ **错误处理** - 完善的错误提示机制
- ✅ **会话管理** - 可以查看、切换、清除聊天记录

## 系统要求

### 1. Ollama服务
- 安装Ollama: https://ollama.ai/
- 启动Ollama服务: `ollama serve`
- 下载deepseek:r1:7b模型: `ollama pull deepseek:r1:7b`

### 2. MongoDB数据库
- 确保MongoDB连接正常
- 数据库连接配置在 `database/database.js`

### 3. Node.js后端
- 安装依赖: `npm install`
- 启动服务: `npm start`

### 4. React前端
- 安装依赖: `npm install`
- 启动开发服务器: `npm run dev`

## API接口

### 1. 健康检查
```
GET /YJL/health
```

### 2. 智能客服聊天（流式）
```
POST /YJL/chat
Content-Type: application/json

{
    "message": "用户消息",
    "sessionId": "会话ID（可选）"
}
```

### 3. 获取聊天历史
```
GET /YJL/chat/history/:sessionId
```

### 4. 清除聊天历史
```
DELETE /YJL/chat/history/:sessionId
```

### 5. 获取会话列表
```
GET /YJL/chat/sessions
```

## 使用步骤

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

### 4. 测试连接
访问连接测试页面，确保所有服务正常运行。

### 5. 使用智能客服
- 访问智能客服页面
- 开始与AI助手对话
- 可以查看聊天历史、切换会话等

## 技术架构

### 后端架构
- **Express.js** - Web框架
- **MongoDB + Mongoose** - 数据存储
- **Axios** - HTTP客户端
- **流式响应** - 使用Server-Sent Events

### 前端架构
- **React + TypeScript** - 前端框架
- **Antd Mobile** - UI组件库
- **Fetch API** - 流式数据接收
- **CSS3** - 样式和动画

### 数据流
1. 用户发送消息到后端
2. 后端调用Ollama API
3. 流式返回AI响应
4. 前端实时显示响应内容
5. 保存聊天记录到数据库

## 故障排除

### 1. Ollama连接失败
- 检查Ollama服务是否启动: `curl http://localhost:11434/api/tags`
- 确认模型已下载: `ollama list`
- 检查防火墙设置

### 2. 数据库连接失败
- 检查MongoDB连接字符串
- 确认网络连接正常
- 检查数据库权限

### 3. 流式响应异常
- 检查浏览器控制台错误
- 确认CORS设置正确
- 检查网络连接稳定性

### 4. 前端显示问题
- 清除浏览器缓存
- 检查控制台错误
- 确认所有依赖已安装

## 自定义配置

### 修改AI模型
在 `routes/YJL/index.js` 中修改模型名称：
```javascript
model: 'deepseek:r1:7b' // 改为其他模型
```

### 调整AI参数
```javascript
options: {
    temperature: 0.7,    // 创造性（0-1）
    top_p: 0.9,         // 核采样
    max_tokens: 1000     // 最大token数
}
```

### 修改系统提示词
```javascript
content: '你是一个专业的智能客服助手...' // 自定义系统提示词
```

## 扩展功能

### 1. 添加更多AI模型
- 支持多种Ollama模型
- 根据用户需求选择合适的模型

### 2. 增加文件上传
- 支持图片、文档上传
- 多模态AI对话

### 3. 用户认证
- 添加用户登录系统
- 个人聊天历史管理

### 4. 数据分析
- 聊天记录分析
- 用户行为统计

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。 