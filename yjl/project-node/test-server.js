const axios = require('axios');

async function testServer() {
    try {
        console.log('测试后端服务器连接...');
        
        // 测试健康检查
        const healthResponse = await axios.get('http://localhost:3000/YJL/health');
        console.log('✅ 健康检查成功:', healthResponse.data);
        
        // 测试聊天接口
        const chatResponse = await axios.post('http://localhost:3000/YJL/chat', {
            message: '你好',
            sessionId: 'test_session',
            productInfo: {
                name: '测试商品',
                price: 100,
                category: '测试分类'
            }
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ 聊天接口测试成功');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testServer(); 