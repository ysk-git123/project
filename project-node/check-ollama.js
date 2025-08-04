const axios = require('axios');

async function checkOllama() {
    console.log('🔍 检查Ollama状态...\n');

    try {
        // 检查服务状态
        const response = await axios.get('http://localhost:11434/api/tags');
        console.log('✅ Ollama服务正常');
        
        const models = response.data.models || [];
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

        // 测试第一个可用模型
        const firstModel = models[0].name;
        console.log(`\n🧪 测试模型: ${firstModel}`);
        
        const testResponse = await axios.post('http://localhost:11434/api/chat', {
            model: firstModel,
            messages: [{ role: 'user', content: 'hi' }]
        });
        
        console.log('✅ 模型测试成功');
        console.log('响应:', testResponse.data);

    } catch (error) {
        console.error('❌ 检查失败:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 解决方案:');
            console.log('1. 启动Ollama服务: ollama serve');
            console.log('2. 等待服务启动完成');
            console.log('3. 重新运行此脚本');
        } else if (error.response?.status === 400) {
            console.log('\n💡 400错误 - 可能的原因:');
            console.log('1. 模型未正确下载');
            console.log('2. 模型名称错误');
            console.log('3. 请求格式问题');
        }
    }
}

checkOllama(); 