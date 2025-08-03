#!/usr/bin/env node

const axios = require('axios');
const { spawn, exec } = require('child_process');
const mongoose = require('mongoose');

class QuickFix {
    constructor() {
        this.fixes = [];
    }

    log(message, type = 'info') {
        const prefix = {
            info: '🔧',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };
        console.log(`${prefix[type]} ${message}`);
    }

    async checkAndFixMongoDB() {
        this.log('检查MongoDB连接...', 'info');
        
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
            this.log('MongoDB连接成功', 'success');
            await mongoose.disconnect();
            return true;
        } catch (error) {
            this.log(`MongoDB连接失败: ${error.message}`, 'error');
            
            // 尝试快速修复
            this.log('尝试MongoDB快速修复...', 'info');
            
            // 修复1: 检查网络
            this.log('修复1: 检查网络连接', 'info');
            try {
                await axios.get('https://cloud.mongodb.com/', { timeout: 5000 });
                this.log('网络连接正常', 'success');
            } catch (netError) {
                this.log('网络连接异常，请检查网络设置', 'warning');
                this.fixes.push('检查网络连接');
            }
            
            // 修复2: 使用替代连接字符串
            this.log('修复2: 尝试替代连接配置', 'info');
            try {
                const altOptions = {
                    ...mongoOptions,
                    ssl: true,
                    tlsInsecure: false,
                    family: 0 // 允许IPv4和IPv6
                };
                await mongoose.connect(mongoURI, altOptions);
                this.log('替代配置连接成功', 'success');
                await mongoose.disconnect();
                return true;
            } catch (altError) {
                this.log('替代配置也失败', 'warning');
            }
            
            this.fixes.push('修复MongoDB连接配置');
            return false;
        }
    }

    async checkAndFixOllama() {
        this.log('检查Ollama服务...', 'info');
        
        try {
            // 检查服务状态
            const response = await axios.get('http://localhost:11434/api/tags', { timeout: 5000 });
            this.log('Ollama服务运行正常', 'success');
            
            const models = response.data.models || [];
            if (models.length === 0) {
                this.log('没有可用模型，尝试下载deepseek-r1:7b', 'warning');
                await this.downloadOllamaModel();
                return false;
            }
            
            const targetModel = 'deepseek-r1:7b';
            const hasTargetModel = models.some(m => m.name === targetModel);
            
            if (!hasTargetModel) {
                this.log(`${targetModel}模型不存在，尝试下载`, 'warning');
                await this.downloadOllamaModel();
                return false;
            }
            
            // 测试模型
            this.log('测试模型响应...', 'info');
            const testResponse = await axios.post('http://localhost:11434/api/chat', {
                model: targetModel,
                messages: [{ role: 'user', content: '测试' }],
                stream: false
            }, { timeout: 30000 });
            
            this.log('模型测试成功', 'success');
            return true;
            
        } catch (error) {
            this.log(`Ollama检查失败: ${error.message}`, 'error');
            
            if (error.code === 'ECONNREFUSED') {
                this.log('Ollama服务未启动，尝试启动', 'warning');
                await this.startOllamaService();
            } else if (error.code === 'ECONNABORTED') {
                this.log('Ollama响应超时，可能需要重启服务', 'warning');
                this.fixes.push('重启Ollama服务');
            }
            
            return false;
        }
    }

    async startOllamaService() {
        return new Promise((resolve) => {
            this.log('尝试启动Ollama服务...', 'info');
            
            // 在Windows上启动Ollama
            const ollamaProcess = spawn('ollama', ['serve'], { 
                detached: true,
                stdio: 'ignore'
            });
            
            ollamaProcess.unref();
            
            setTimeout(async () => {
                try {
                    await axios.get('http://localhost:11434/api/tags', { timeout: 3000 });
                    this.log('Ollama服务启动成功', 'success');
                    resolve(true);
                } catch (error) {
                    this.log('Ollama服务启动失败，请手动启动', 'warning');
                    this.fixes.push('手动启动Ollama服务: ollama serve');
                    resolve(false);
                }
            }, 5000);
        });
    }

    async downloadOllamaModel() {
        return new Promise((resolve) => {
            this.log('开始下载deepseek-r1:7b模型...', 'info');
            
            const pullProcess = spawn('ollama', ['pull', 'deepseek-r1:7b'], {
                stdio: 'pipe'
            });
            
            pullProcess.stdout.on('data', (data) => {
                process.stdout.write(data);
            });
            
            pullProcess.stderr.on('data', (data) => {
                process.stderr.write(data);
            });
            
            pullProcess.on('close', (code) => {
                if (code === 0) {
                    this.log('模型下载成功', 'success');
                    resolve(true);
                } else {
                    this.log('模型下载失败', 'error');
                    this.fixes.push('手动下载模型: ollama pull deepseek-r1:7b');
                    resolve(false);
                }
            });
            
            // 30分钟超时
            setTimeout(() => {
                pullProcess.kill();
                this.log('模型下载超时', 'warning');
                this.fixes.push('手动下载模型: ollama pull deepseek-r1:7b');
                resolve(false);
            }, 30 * 60 * 1000);
        });
    }

    async installDependencies() {
        this.log('检查并安装依赖...', 'info');
        
        return new Promise((resolve) => {
            const npmProcess = spawn('npm', ['install'], {
                stdio: 'pipe',
                cwd: __dirname
            });
            
            npmProcess.stdout.on('data', (data) => {
                process.stdout.write(data);
            });
            
            npmProcess.on('close', (code) => {
                if (code === 0) {
                    this.log('依赖安装成功', 'success');
                    resolve(true);
                } else {
                    this.log('依赖安装失败', 'error');
                    this.fixes.push('手动安装依赖: npm install');
                    resolve(false);
                }
            });
        });
    }

    async runQuickFix() {
        console.log('🚀 开始快速修复...\n');
        
        // 1. 安装依赖
        await this.installDependencies();
        
        // 2. 修复MongoDB
        const mongoOk = await this.checkAndFixMongoDB();
        
        // 3. 修复Ollama
        const ollamaOk = await this.checkAndFixOllama();
        
        console.log('\n📊 修复结果:');
        console.log('================');
        console.log(`MongoDB: ${mongoOk ? '✅ 正常' : '❌ 需要手动修复'}`);
        console.log(`Ollama: ${ollamaOk ? '✅ 正常' : '❌ 需要手动修复'}`);
        
        if (this.fixes.length > 0) {
            console.log('\n📋 需要手动执行的修复步骤:');
            this.fixes.forEach((fix, index) => {
                console.log(`${index + 1}. ${fix}`);
            });
        }
        
        if (mongoOk && ollamaOk) {
            console.log('\n🎉 所有服务正常！可以启动应用程序:');
            console.log('  npm start');
        } else {
            console.log('\n⚠️  请先解决上述问题，然后重新运行此脚本');
        }
        
        console.log('\n💡 如果问题持续存在，请运行详细诊断:');
        console.log('  node comprehensive-fix.js');
    }
}

// 运行快速修复
if (require.main === module) {
    const quickFix = new QuickFix();
    quickFix.runQuickFix().catch(console.error);
}

module.exports = QuickFix; 