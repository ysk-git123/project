const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongoose = require('mongoose');

// 聊天历史模型
const chatHistorySchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
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
    const { message, sessionId, productInfo = {} } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: '消息不能为空' });
    }

    try {
        // 设置响应头以支持流式传输
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        // 使用findOneAndUpdate避免并发保存问题
        let chatHistory = await ChatHistory.findOneAndUpdate(
            { sessionId },
            { 
                $push: { 
                    messages: {
                        role: 'user',
                        content: message,
                        timestamp: new Date()
                    }
                },
                $setOnInsert: {
                    createdAt: new Date()
                },
                $set: {
                    updatedAt: new Date()
                }
            },
            { 
                upsert: true,
                new: true,
                setDefaultsOnInsert: true 
            }
        );

        // 构建系统提示词
        let systemPrompt = '你是一个专业的智能客服助手，专门为用户提供购物咨询、产品推荐、订单查询等服务。请用友好、专业的态度回答用户问题，并提供准确、有用的信息。';
        
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

        // 调用Ollama API
        const ollamaResponse = await axios.post('http://localhost:11434/api/chat', {
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
            timeout: 300000
        });

        let assistantResponse = '';
        let saveTimeout;

        ollamaResponse.data.on('data', (chunk) => {
            try {
                const lines = chunk.toString().split('\n');
                
                for (const line of lines) {
                    if (line.trim() === '') continue;
                    
                    try {
                        const parsed = JSON.parse(line);
                        
                        if (parsed.done) {
                            clearTimeout(saveTimeout);
                            res.write('data: [DONE]\n\n');
                            res.end();
                            return;
                        }
                        
                        if (parsed.message?.content) {
                            assistantResponse += parsed.message.content;
                            res.write(`data: ${JSON.stringify({ content: parsed.message.content })}\n\n`);
                        }
                    } catch (parseError) {
                        console.log('跳过无法解析的行:', line.substring(0, 100));
                    }
                }
            } catch (error) {
                console.error('处理流式响应失败:', error);
                res.write('data: {"error": "处理响应失败"}\n\n');
                res.end();
            }
        });

        ollamaResponse.data.on('error', (error) => {
            console.error('Ollama流式响应错误:', error);
            res.write('data: {"error": "AI服务暂时不可用"}\n\n');
            res.end();
        });

        ollamaResponse.data.on('end', () => {
            // 保存助手回复到数据库
            if (assistantResponse) {
                saveTimeout = setTimeout(async () => {
                    try {
                        await ChatHistory.findOneAndUpdate(
                            { sessionId },
                            {
                                $push: {
                                    messages: {
                                        role: 'assistant',
                                        content: assistantResponse,
                                        timestamp: new Date()
                                    }
                                },
                                $set: {
                                    updatedAt: new Date()
                                }
                            }
                        );
                    } catch (error) {
                        console.error('保存助手回复失败:', error);
                    }
                }, 1000); // 延迟1秒保存以避免并发问题
            }
        });

    } catch (error) {
        console.error('智能客服聊天失败:', error);
        res.write('data: {"error": "AI服务暂时不可用，请稍后重试"}\n\n');
        res.end();
    }
});

// 获取所有会话列表
router.get('/chat/sessions', async (req, res) => {
    try {
        const sessions = await ChatHistory.aggregate([
            {
                $project: {
                    sessionId: 1,
                    updatedAt: 1,
                    lastMessage: {
                        $arrayElemAt: ['$messages', -1]
                    }
                }
            },
            {
                $sort: { updatedAt: -1 }
            },
            {
                $limit: 20
            }
        ]);

        res.json({ 
            sessions: sessions.map(s => ({
                sessionId: s.sessionId,
                lastMessage: s.lastMessage?.content 
                    ? s.lastMessage.content.substring(0, 50) + (s.lastMessage.content.length > 50 ? '...' : '')
                    : '暂无消息',
                updatedAt: s.updatedAt
            })) 
        });
    } catch (error) {
        console.error('获取会话列表失败:', error);
        res.status(500).json({ error: '获取会话列表失败' });
    }
});

// 使用支付路由
router.use('/', require('./payment'));

// 使用地图路由
router.use('/api', require('./ditu'));

module.exports = router;