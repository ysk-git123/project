const axios = require('axios');

async function testOllama() {
    try {
        console.log('🔍 测试Ollama API...\n');

        // 测试1: 检查模型列表
        console.log('1. 检查可用模型...');
        const modelsResponse = await axios.get('http://localhost:11434/api/tags');
        console.log('✅ 可用模型:', modelsResponse.data.models?.map(m => m.name).join(', ') || '无');

        // 测试2: 简单聊天请求
        console.log('\n2. 测试简单聊天请求...');
        const chatResponse = await axios.post('http://localhost:11434/api/chat', {
            model: 'deepseek:r1:7b',
            messages: [
                { role: 'user', content: '你好' }
            ],
            stream: false
        });
        console.log('✅ 聊天请求成功');
        console.log('响应:', chatResponse.data);

        // 测试3: 流式聊天请求
        console.log('\n3. 测试流式聊天请求...');
        const streamResponse = await axios.post('http://localhost:11434/api/chat', {
            model: 'deepseek:r1:7b',
            messages: [
                { role: 'user', content: '你好' }
            ],
            stream: true,
            options: {
                temperature: 0.7,
                top_p: 0.9,
                num_predict: 100
            }
        }, {
            responseType: 'stream'
        });

        console.log('✅ 流式请求成功');
        
        // 读取流式响应
        let responseText = '';
        streamResponse.data.on('data', (chunk) => {
            const lines = chunk.toString().split('\n');
            for (const line of lines) {
                if (line.trim() && line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data !== '[DONE]') {
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                responseText += parsed.choices[0].delta.content;
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }
        });

        streamResponse.data.on('end', () => {
            console.log('流式响应完成:', responseText);
        });

    } catch (error) {
        console.error('❌ Ollama测试失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testOllama(); 