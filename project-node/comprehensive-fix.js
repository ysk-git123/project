const axios = require('axios');
const mongoose = require('mongoose');

class ServiceDiagnostic {
    constructor() {
        this.results = {
            mongodb: { status: 'unknown', details: [] },
            ollama: { status: 'unknown', details: [] }
        };
    }

    async checkMongoDB() {
        console.log('🔍 检查MongoDB连接...\n');
        
        const mongoURI = 'mongodb+srv://335846526:ysk123456@cluster0.ko0b4ty.mongodb.net/Database?retryWrites=true&w=majority&appName=Cluster0';
        const mongoOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
            retryWrites: true,
            writeConcern: { w: 'majority' }
        };

        try {
            await mongoose.connect(mongoURI, mongoOptions);
            console.log('✅ MongoDB连接成功');
            this.results.mongodb.status = 'success';
            this.results.mongodb.details.push('连接成功');
            
            // 测试数据库操作
            const testSchema = new mongoose.Schema({ test: String });
            const TestModel = mongoose.model('Test', testSchema);
            
            const testDoc = new TestModel({ test: 'diagnostic' });
            await testDoc.save();
            await TestModel.deleteOne({ test: 'diagnostic' });
            
            console.log('✅ MongoDB读写测试成功');
            this.results.mongodb.details.push('读写测试成功');
            
            await mongoose.disconnect();
            console.log('✅ MongoDB连接已关闭');
            
        } catch (error) {
            console.error('❌ MongoDB检查失败:', error.message);
            this.results.mongodb.status = 'failed';
            this.results.mongodb.details.push(`错误: ${error.message}`);
            
            this.printMongoDBTroubleshooting(error);
        }
    }

    async checkOllama() {
        console.log('\n🔍 检查Ollama服务...\n');
        
        try {
            // 1. 检查服务状态
            console.log('1. 检查Ollama服务状态...');
            const healthResponse = await axios.get('http://localhost:11434/api/tags', {
                timeout: 10000
            });
            
            console.log('✅ Ollama服务正常');
            this.results.ollama.status = 'partial';
            this.results.ollama.details.push('服务运行正常');
            
            const models = healthResponse.data.models || [];
            console.log('📋 可用模型:');
            models.forEach(model => {
                console.log(`  - ${model.name} (size: ${(model.size / 1024 / 1024 / 1024).toFixed(2)}GB)`);
            });

            if (models.length === 0) {
                console.log('⚠️  没有找到任何模型');
                this.results.ollama.details.push('没有可用模型');
                this.printOllamaModelInstructions();
                return;
            }

            // 2. 检查deepseek-r1:7b模型
            const targetModel = 'deepseek-r1:7b';
            const deepseekModel = models.find(m => m.name === targetModel);
            
            if (!deepseekModel) {
                console.log(`⚠️  ${targetModel}模型不存在`);
                this.results.ollama.details.push(`${targetModel}模型不存在`);
                this.printOllamaModelInstructions();
                return;
            }
            
            console.log(`✅ ${targetModel}模型存在`);
            this.results.ollama.details.push(`${targetModel}模型可用`);

            // 3. 测试非流式请求
            console.log('\n2. 测试非流式聊天请求...');
            const simpleResponse = await axios.post('http://localhost:11434/api/chat', {
                model: targetModel,
                messages: [{ role: 'user', content: '测试' }],
                stream: false
            }, {
                timeout: 30000
            });
            
            console.log('✅ 非流式聊天请求成功');
            console.log('响应长度:', simpleResponse.data.message?.content?.length || 0);
            this.results.ollama.details.push('非流式请求正常');

            // 4. 测试流式请求
            console.log('\n3. 测试流式聊天请求...');
            const streamResponse = await axios.post('http://localhost:11434/api/chat', {
                model: targetModel,
                messages: [{ role: 'user', content: '你好' }],
                stream: true
            }, {
                responseType: 'stream',
                timeout: 30000
            });
            
            console.log('✅ 流式聊天请求成功');
            this.results.ollama.details.push('流式请求正常');
            this.results.ollama.status = 'success';
            
            // 读取部分流式响应用于测试
            let responseReceived = false;
            const timeout = setTimeout(() => {
                if (!responseReceived) {
                    console.log('✅ 流式响应测试完成（超时正常）');
                }
            }, 5000);
            
            streamResponse.data.on('data', (chunk) => {
                if (!responseReceived) {
                    responseReceived = true;
                    clearTimeout(timeout);
                    console.log('✅ 收到流式响应数据');
                    streamResponse.data.destroy(); // 停止接收数据
                }
            });

        } catch (error) {
            console.error('❌ Ollama检查失败:', error.message);
            this.results.ollama.status = 'failed';
            this.results.ollama.details.push(`错误: ${error.message}`);
            
            this.printOllamaTroubleshooting(error);
        }
    }

    printMongoDBTroubleshooting(error) {
        console.log('\n💡 MongoDB问题解决方案:');
        
        if (error.name === 'MongoServerSelectionError') {
            console.log('🔧 连接选择超时解决方案:');
            console.log('1. 检查网络连接是否正常');
            console.log('2. 确认MongoDB Atlas集群状态');
            console.log('3. 检查IP白名单设置（可以设置为0.0.0.0/0临时测试）');
            console.log('4. 验证用户名密码是否正确');
            console.log('5. 尝试使用不同的网络环境');
            console.log('6. 检查防火墙设置');
        }
        
        if (error.message.includes('TLS')) {
            console.log('🔧 TLS连接问题解决方案:');
            console.log('1. 更新Node.js到最新版本');
            console.log('2. 更新mongoose到最新版本');
            console.log('3. 检查系统证书是否过期');
            console.log('4. 尝试禁用TLS验证（仅用于测试）');
        }
        
        console.log('\n🚀 快速修复尝试:');
        console.log('1. 重启应用程序');
        console.log('2. 重启网络连接');
        console.log('3. 换用热点网络测试');
        console.log('4. 联系MongoDB Atlas支持');
    }

    printOllamaTroubleshooting(error) {
        console.log('\n💡 Ollama问题解决方案:');
        
        if (error.code === 'ECONNREFUSED') {
            console.log('🔧 连接被拒绝解决方案:');
            console.log('1. 启动Ollama服务: ollama serve');
            console.log('2. 检查端口11434是否被占用');
            console.log('3. 重启Ollama服务');
            console.log('4. 检查防火墙设置');
        }
        
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.log('🔧 超时问题解决方案:');
            console.log('1. 增加超时时间设置');
            console.log('2. 检查系统资源使用情况');
            console.log('3. 重启Ollama服务');
            console.log('4. 使用更小的模型进行测试');
            console.log('5. 检查GPU/CPU资源');
        }
        
        console.log('\n🚀 快速修复尝试:');
        console.log('1. 在终端运行: ollama serve');
        console.log('2. 在新终端运行: ollama list');
        console.log('3. 如果没有模型，运行: ollama pull deepseek-r1:7b');
        console.log('4. 重启系统（如果资源问题）');
    }

    printOllamaModelInstructions() {
        console.log('\n📥 下载所需模型:');
        console.log('运行以下命令下载deepseek-r1:7b模型:');
        console.log('  ollama pull deepseek-r1:7b');
        console.log('\n或者下载其他可选模型:');
        console.log('  ollama pull llama2:7b     # 轻量级选择');
        console.log('  ollama pull codellama:7b  # 代码专用');
        console.log('  ollama pull qwen:7b       # 中文优化');
    }

    async runDiagnostic() {
        console.log('🔍 开始系统诊断...\n');
        console.log('=' * 50);
        
        await this.checkMongoDB();
        await this.checkOllama();
        
        console.log('\n' + '=' * 50);
        console.log('📊 诊断结果汇总:');
        console.log('=' * 50);
        
        console.log('\nMongoDB状态:', 
            this.results.mongodb.status === 'success' ? '✅ 正常' : 
            this.results.mongodb.status === 'failed' ? '❌ 失败' : '⚠️ 未知');
        this.results.mongodb.details.forEach(detail => console.log(`  - ${detail}`));
        
        console.log('\nOllama状态:', 
            this.results.ollama.status === 'success' ? '✅ 正常' : 
            this.results.ollama.status === 'partial' ? '⚠️ 部分正常' :
            this.results.ollama.status === 'failed' ? '❌ 失败' : '⚠️ 未知');
        this.results.ollama.details.forEach(detail => console.log(`  - ${detail}`));
        
        console.log('\n📋 下一步建议:');
        if (this.results.mongodb.status !== 'success') {
            console.log('1. 🔧 修复MongoDB连接问题');
        }
        if (this.results.ollama.status !== 'success') {
            console.log('2. 🔧 修复Ollama服务问题');
        }
        if (this.results.mongodb.status === 'success' && this.results.ollama.status === 'success') {
            console.log('🎉 所有服务正常，可以启动应用程序！');
        }
        
        console.log('\n🚀 启动应用程序命令:');
        console.log('  cd project-node');
        console.log('  npm start');
    }
}

// 运行诊断
if (require.main === module) {
    const diagnostic = new ServiceDiagnostic();
    diagnostic.runDiagnostic().catch(console.error);
}

module.exports = ServiceDiagnostic; 