const axios = require('axios');

async function simpleTest() {
    try {
        console.log('🧪 简单测试Ollama API...\n');

        // 测试基本聊天请求
        const response = await axios.post('http://localhost:11434/api/chat', {
            model: 'deepseek:r1:7b',
            messages: [
                { role: 'user', content: '你好' }
            ],
            stream: false
        });

        console.log('✅ 测试成功!');
        console.log('响应:', response.data);

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.response) {
            console.error('状态码:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

simpleTest(); 