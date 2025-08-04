const axios = require('axios');

async function diagnoseOllama() {
    console.log('🔍 Ollama详细诊断...\n');

    try {
        // 1. 检查Ollama服务状态
        console.log('1. 检查Ollama服务状态...');
        try {
            const healthResponse = await axios.get('http://localhost:11434/api/tags');
            console.log('✅ Ollama服务正常');
            
            const models = healthResponse.data.models || [];
            console.log('📋 可用模型:');
            models.forEach(model => {
                console.log(`  - ${model.name}`);
            });

            if (models.length === 0) {
                console.log('\n⚠️  没有找到任何模型');
                console.log('请运行以下命令下载模型:');
                console.log('  ollama pull deepseek:r1:7b');
                return;
            }

            // 2. 检查deepseek:r1:7b模型是否存在
            const deepseekModel = models.find(m => m.name === 'deepseek:r1:7b');
            if (!deepseekModel) {
                console.log('\n⚠️  deepseek:r1:7b模型不存在');
                console.log('请运行: ollama pull deepseek:r1:7b');
                return;
            }
            console.log('✅ deepseek:r1:7b模型存在');

            // 3. 测试最简单的请求
            console.log('\n2. 测试简单聊天请求...');
            const simpleResponse = await axios.post('http://localhost:11434/api/chat', {
                model: 'deepseek:r1:7b',
                messages: [{ role: 'user', content: '你好' }]
            });
            console.log('✅ 简单聊天请求成功');
            console.log('响应:', simpleResponse.data);

            // 4. 测试流式请求
            console.log('\n3. 测试流式聊天请求...');
            const streamResponse = await axios.post('http://localhost:11434/api/chat', {
                model: 'deepseek:r1:7b',
                messages: [{ role: 'user', content: '你好' }],
                stream: true
            }, {
                responseType: 'stream'
            });
            console.log('✅ 流式聊天请求成功');

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

            console.log('\n🎉 所有测试通过！Ollama配置正常。');

        } catch (error) {
            console.error('❌ 诊断失败:', error.message);
            
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

    } catch (error) {
        console.error('❌ 诊断失败:', error.message);
    }
}

diagnoseOllama(); 