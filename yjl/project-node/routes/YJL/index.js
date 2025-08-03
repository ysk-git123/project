const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongoose = require('mongoose');

// 引入支付路由
const paymentRouter = require('./payment');

// 引入地图路由
const dituRouter = require('./ditu');

// 聊天历史模型
const chatHistorySchema = new mongoose.Schema({
    sessionId: { type: String, required: true },
    messages: [{
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

// 健康检查
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'YJL智能客服服务正常运行' });
});

// 获取聊天历史
router.get('/chat/history/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const history = await ChatHistory.findOne({ sessionId });
        
        if (!history) {
            return res.json({ messages: [] });
        }
        
        res.json({ messages: history.messages });
    } catch (error) {
        console.error('获取聊天历史失败:', error);
        res.status(500).json({ error: '获取聊天历史失败' });
    }
});

// 清除聊天历史
router.delete('/chat/history/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        await ChatHistory.deleteOne({ sessionId });
        res.json({ message: '聊天历史已清除' });
    } catch (error) {
        console.error('清除聊天历史失败:', error);
        res.status(500).json({ error: '清除聊天历史失败' });
    }
});

// 智能客服聊天接口（流式响应）
router.post('/chat', async (req, res) => {
    const { message, sessionId = 'default', productInfo = {} } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: '消息不能为空' });
    }

    try {
        // 设置响应头以支持流式传输
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        // 获取或创建聊天历史
        let chatHistory = await ChatHistory.findOne({ sessionId });
        if (!chatHistory) {
            chatHistory = new ChatHistory({ sessionId, messages: [] });
        }

        // 添加用户消息到历史
        chatHistory.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });

        // 构建系统提示词，包含商品信息
        let systemPrompt = '你是一个专业的智能客服助手，专门为用户提供购物咨询、产品推荐、订单查询等服务。请用友好、专业的态度回答用户问题，并提供准确、有用的信息。';
        
        // 如果有商品信息，添加到系统提示词中
        if (productInfo && productInfo.name) {
            systemPrompt += `\n\n当前用户正在咨询的商品信息：
商品名称：${productInfo.name}
价格：¥${productInfo.price}
分类：${productInfo.category}
描述：${productInfo.description || '暂无描述'}
可选颜色：${productInfo.colors ? productInfo.colors.join(', ') : '无'}
可选尺码：${productInfo.sizes ? productInfo.sizes.join(', ') : '无'}

请根据这些商品信息为用户提供专业的购物建议和解答。`;
        }

        // 构建发送给Ollama的消息
        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            ...chatHistory.messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        ];

        // 调用Ollama API进行流式响应
        let ollamaResponse;
        try {
            // 检查Ollama服务是否可用
            try {
                await axios.get('http://localhost:11434/api/tags', { timeout: 5000 });
            } catch (checkError) {
                throw new Error('Ollama服务不可用，请确保Ollama已启动并运行在端口11434');
            }

            // 使用改进的请求配置
            ollamaResponse = await axios.post('http://localhost:11434/api/chat', {
                model: 'deepseek-r1:7b',
                messages: messages,
                stream: true,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    top_k: 40
                }
            }, {
                responseType: 'stream',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/x-ndjson'
                },
                timeout: 300000, // 增加到300秒(5分钟)超时
                maxRedirects: 0,
                // 添加连接配置
                httpAgent: new (require('http').Agent)({
                    keepAlive: true,
                    timeout: 300000
                })
            });
        } catch (error) {
            console.error('Ollama API调用失败:', error.message);
            if (error.response) {
                console.error('状态码:', error.response.status);
                console.error('响应数据:', error.response.data);
            } else if (error.code === 'ECONNREFUSED') {
                console.error('连接被拒绝: Ollama服务可能未启动');
            } else if (error.code === 'ECONNABORTED') {
                console.error('请求超时: Ollama响应时间过长');
            }
            throw error;
        }

        let assistantResponse = '';
        let isFirstChunk = true;
        let hasError = false;

        // 设置超时处理
        const timeout = setTimeout(() => {
            if (!res.headersSent) {
                res.status(500).json({ error: 'AI服务响应超时，请稍后重试' });
            } else {
                res.write('data: {"error": "AI服务响应超时，请稍后重试"}\n\n');
                res.end();
            }
        }, 270000); // 270秒(4.5分钟)超时，比axios超时稍短

        ollamaResponse.data.on('data', (chunk) => {
            try {
                const lines = chunk.toString().split('\n');
                
                for (const line of lines) {
                    if (line.trim() === '') continue;
                    
                    try {
                        // Ollama返回的是NDJSON格式，每行一个JSON对象
                        const parsed = JSON.parse(line);
                        
                        // 检查是否完成
                        if (parsed.done) {
                            clearTimeout(timeout);
                            // 流式响应结束，保存到数据库
                            if (assistantResponse.trim()) {
                            chatHistory.messages.push({
                                role: 'assistant',
                                content: assistantResponse,
                                timestamp: new Date()
                            });
                            chatHistory.updatedAt = new Date();
                                // 延迟保存避免并行保存错误
                                setTimeout(() => {
                                    chatHistory.save().catch(err => console.error('保存聊天历史失败:', err));
                                }, 100);
                            }
                            
                            res.write('data: [DONE]\n\n');
                            res.end();
                            return;
                        }
                        
                        // 提取消息内容
                        let content = '';
                        if (parsed.message && parsed.message.content) {
                            content = parsed.message.content;
                        } else if (parsed.response) {
                            content = parsed.response;
                        } else if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                            content = parsed.choices[0].delta.content;
                        }
                        
                        if (content) {
                                assistantResponse += content;
                                
                                // 发送流式数据到前端
                                res.write(`data: ${JSON.stringify({ content, isFirstChunk })}\n\n`);
                                isFirstChunk = false;
                            }
                        
                        } catch (parseError) {
                        // 忽略无法解析的行，可能是数据分片
                        console.log('跳过无法解析的行:', line.substring(0, 100));
                    }
                }
            } catch (error) {
                console.error('处理流式响应失败:', error);
                hasError = true;
                clearTimeout(timeout);
                if (!res.headersSent) {
                    res.status(500).json({ error: '处理响应失败' });
                } else {
                    res.write('data: {"error": "处理响应失败"}\n\n');
                    res.end();
                }
            }
        });

        ollamaResponse.data.on('error', (error) => {
            console.error('Ollama流式响应错误:', error);
            hasError = true;
            clearTimeout(timeout);
            if (!res.headersSent) {
                res.status(500).json({ error: 'AI服务暂时不可用' });
            } else {
                res.write('data: {"error": "AI服务暂时不可用"}\n\n');
                res.end();
            }
        });

        ollamaResponse.data.on('end', () => {
            clearTimeout(timeout);
            if (!hasError && assistantResponse) {
                // 如果没有错误且有响应内容，保存到数据库
                chatHistory.messages.push({
                    role: 'assistant',
                    content: assistantResponse,
                    timestamp: new Date()
                });
                chatHistory.updatedAt = new Date();
                // 延迟保存避免并行保存错误
                setTimeout(() => {
                    chatHistory.save().catch(err => console.error('保存聊天历史失败:', err));
                }, 200);
            }
        });

    } catch (error) {
        console.error('智能客服聊天失败:', error);
        
        // 如果是流式响应已经开始，需要特殊处理
        if (!res.headersSent) {
            res.status(500).json({ error: 'AI服务暂时不可用，请稍后重试' });
        } else {
            res.write('data: {"error": "AI服务暂时不可用，请稍后重试"}\n\n');
            res.end();
        }
    }
});

// 获取所有会话列表
router.get('/chat/sessions', async (req, res) => {
    try {
        const sessions = await ChatHistory.find({}, { sessionId: 1, updatedAt: 1, 'messages.0.content': 1 })
            .sort({ updatedAt: -1 })
            .limit(20);
        
        res.json({ sessions: sessions.map(s => ({
            sessionId: s.sessionId,
            lastMessage: s.messages.length > 0 && s.messages[s.messages.length - 1].content ? 
                s.messages[s.messages.length - 1].content.substring(0, 50) + '...' : 
                '暂无消息',
            updatedAt: s.updatedAt
        })) });
    } catch (error) {
        console.error('获取会话列表失败:', error);
        res.status(500).json({ error: '获取会话列表失败' });
    }
});

// 使用支付路由
router.use('/', paymentRouter);

// 使用地图路由 - 修复路由挂载
router.use('/api', dituRouter);

module.exports = router;
