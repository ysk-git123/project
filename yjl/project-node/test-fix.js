const axios = require('axios');

async function testFix() {
    try {
        console.log('🧪 测试修复后的API...\n');
        
        const response = await axios.post('http://localhost:11434/api/chat', {
            model: 'deepseek-r1:7b',
            messages: [{ role: 'user', content: '你好' }],
            stream: false
        });
        
        console.log('✅ API测试成功!');
        console.log('响应:', response.data);
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.response) {
            console.error('状态码:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testFix(); 