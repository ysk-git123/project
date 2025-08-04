const axios = require('axios');

async function checkServices() {
    console.log('🔍 检查智能客服系统服务状态...\n');

    // 检查后端服务
    try {
        const backendResponse = await axios.get('http://localhost:3000/YJL/health', { timeout: 5000 });
        console.log('✅ 后端服务正常 (端口3000)');
        console.log('   响应:', backendResponse.data);
    } catch (error) {
        console.log('❌ 后端服务异常 (端口3000)');
        console.log('   错误:', error.message);
    }

    // 检查Ollama服务
    try {
        const ollamaResponse = await axios.get('http://localhost:11434/api/tags', { timeout: 5000 });
        console.log('✅ Ollama服务正常 (端口11434)');
        console.log('   可用模型:', ollamaResponse.data.models?.map(m => m.name).join(', ') || '无');
    } catch (error) {
        console.log('❌ Ollama服务异常 (端口11434)');
        console.log('   错误:', error.message);
    }

    // 检查前端服务
    try {
        const frontendResponse = await axios.get('http://localhost:5173', { timeout: 5000 });
        console.log('✅ 前端服务正常 (端口5173)');
    } catch (error) {
        console.log('❌ 前端服务异常 (端口5173)');
        console.log('   错误:', error.message);
    }

    console.log('\n📋 服务状态总结:');
    console.log('1. 后端服务: 处理API请求和数据库操作');
    console.log('2. Ollama服务: 提供AI模型推理');
    console.log('3. 前端服务: 提供用户界面');
    console.log('\n🚀 如果所有服务都正常，可以访问:');
    console.log('   - 前端: http://localhost:5173');
    console.log('   - 测试页面: http://localhost:5173/customer-service-test');
    console.log('   - 智能客服: http://localhost:5173/ai-customer-service');
}

checkServices().catch(console.error); 