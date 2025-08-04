const axios = require('axios');

async function testOllamaSimple() {
    try {
        console.log('🧪 测试Ollama基本功能...\n');

        // 1. 检查服务状态
        console.log('1. 检查Ollama服务...');
        const healthResponse = await axios.get('http://localhost:11434/api/tags');
        console.log('✅ Ollama服务正常');
        console.log('可用模型:', healthResponse.data.models?.map(m => m.name).join(', ') || '无');

        // 2. 测试最简单的聊天请求
        console.log('\n2. 测试简单聊天...');
        const chatResponse = await axios.post('http://localhost:11434/api/chat', {
            model: 'deepseek:r1:7b',
            messages: [{ role: 'user', content: '你好' }]
        });
        console.log('✅ 聊天请求成功');
        console.log('响应:', chatResponse.data);

        // 3. 测试流式请求
        console.log('\n3. 测试流式聊天...');
        const streamResponse = await axios.post('http://localhost:11434/api/chat', {
            model: 'deepseek:r1:7b',
            messages: [{ role: 'user', content: '你好' }],
            stream: true
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

        console.log('\n🎉 所有测试通过！');

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        
        if (error.response) {
            console.error('状态码:', error.response.status);
            console.error('响应数据:', error.response.data);
            
            if (error.response.status === 400) {
                console.log('\n💡 400错误 - 可能的原因:');
                console.log('1. 模型名称错误 - 检查: ollama list');
                console.log('2. 请求格式错误 - 检查JSON格式');
                console.log('3. 模型未下载 - 运行: ollama pull deepseek:r1:7b');
            }
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 连接被拒绝 - 请启动Ollama服务:');
            console.log('ollama serve');
        }
    }
}

testOllamaSimple(); 