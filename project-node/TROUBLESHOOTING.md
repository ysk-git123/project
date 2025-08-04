# 故障排除指南

本指南帮助您解决项目中遇到的MongoDB和Ollama连接问题。

## 🚨 常见问题

根据您提供的错误日志，主要有两个问题：

1. **MongoDB连接问题**: `MongoServerSelectionError` - TLS连接在建立前断开
2. **Ollama API超时**: 60秒超时，表示Ollama服务未响应

## 🔧 快速修复

### 1. 运行自动修复脚本

```bash
# 快速修复（推荐先试这个）
node quick-fix.js

# 详细诊断
node comprehensive-fix.js
```

### 2. 手动修复步骤

#### MongoDB问题修复

如果自动修复失败，请尝试以下步骤：

1. **检查网络连接**
   ```bash
   ping cloud.mongodb.com
   ```

2. **验证MongoDB Atlas设置**
   - 登录 [MongoDB Atlas](https://cloud.mongodb.com/)
   - 检查集群状态
   - 确认IP白名单设置（可临时设置为 `0.0.0.0/0` 测试）
   - 验证用户名密码

3. **尝试不同网络环境**
   - 切换到手机热点测试
   - 关闭VPN/代理

4. **更新依赖**
   ```bash
   npm update mongoose
   ```

#### Ollama问题修复

1. **启动Ollama服务**
   ```bash
   # 启动Ollama服务
   ollama serve
   ```

2. **检查Ollama状态**
   ```bash
   # 在新终端中检查
   ollama list
   ```

3. **下载所需模型**
   ```bash
   # 下载deepseek-r1:7b模型
   ollama pull deepseek-r1:7b
   
   # 或者下载更小的模型进行测试
   ollama pull llama2:7b
   ```

4. **测试模型**
   ```bash
   # 测试模型是否工作
   ollama run deepseek-r1:7b "你好"
   ```

## 📊 诊断工具

### 1. quick-fix.js
- 自动检测和修复常见问题
- 尝试启动服务
- 下载缺失的模型
- 提供手动修复建议

### 2. comprehensive-fix.js
- 详细的系统诊断
- 全面的错误分析
- 具体的故障排除建议
- 服务状态详细报告

### 3. 现有诊断脚本
```bash
# 检查Ollama状态
node check-ollama.js

# Ollama详细诊断
node diagnose-ollama.js
```

## 🔍 错误分析

### MongoDB错误类型

1. **MongoServerSelectionError**
   - 原因：网络连接问题、防火墙、IP白名单
   - 解决：检查网络设置、更新IP白名单

2. **TLS Connection Error**
   - 原因：证书问题、网络中断
   - 解决：更新Node.js、使用替代网络

### Ollama错误类型

1. **ECONNREFUSED**
   - 原因：Ollama服务未启动
   - 解决：运行 `ollama serve`

2. **Timeout**
   - 原因：模型响应慢、资源不足
   - 解决：增加超时时间、重启服务

## 🚀 启动流程

正确的启动顺序：

1. **启动Ollama服务**
   ```bash
   ollama serve
   ```

2. **验证Ollama模型**
   ```bash
   ollama list
   # 如果没有模型，运行：
   ollama pull deepseek-r1:7b
   ```

3. **运行修复脚本（可选）**
   ```bash
   node quick-fix.js
   ```

4. **启动应用程序**
   ```bash
   npm start
   ```

## 💡 预防措施

1. **定期检查服务状态**
   ```bash
   # 添加到启动脚本
   node comprehensive-fix.js && npm start
   ```

2. **监控资源使用**
   - 确保足够的内存（推荐8GB+）
   - 监控磁盘空间（模型文件较大）

3. **网络稳定性**
   - 使用稳定的网络连接
   - 避免频繁切换网络

## 🆘 获取帮助

如果问题仍然存在：

1. **查看详细日志**
   ```bash
   # 启动时查看详细日志
   DEBUG=* npm start
   ```

2. **收集诊断信息**
   ```bash
   node comprehensive-fix.js > diagnostic-report.txt
   ```

3. **常用命令汇总**
   ```bash
   # 检查端口占用
   netstat -ano | findstr :11434
   
   # 重启网络（Windows）
   ipconfig /release && ipconfig /renew
   
   # 清除DNS缓存
   ipconfig /flushdns
   ```

## 📋 快速检查清单

- [ ] Ollama服务运行中 (`ollama serve`)
- [ ] deepseek-r1:7b模型已下载
- [ ] MongoDB Atlas集群运行正常
- [ ] IP地址在白名单中
- [ ] 网络连接稳定
- [ ] 系统资源充足
- [ ] 所有依赖已安装 (`npm install`)

## 🔄 更新说明

本文档的修复脚本已经更新了：

1. **database.js**: 改进了MongoDB连接配置和错误处理
2. **routes/YJL/index.js**: 优化了Ollama API调用和响应处理
3. **新增脚本**: 
   - `quick-fix.js`: 一键修复常见问题
   - `comprehensive-fix.js`: 详细诊断系统

运行修复脚本后，您的应用程序应该能够正常连接MongoDB和Ollama服务。 