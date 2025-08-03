const mongoose = require('mongoose');

// MongoDB连接配置
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10, // 最大连接池大小
    serverSelectionTimeoutMS: 5000, // 服务器选择超时
    socketTimeoutMS: 45000, // Socket超时
    family: 4, // 使用IPv4
    retryWrites: true,
    writeConcern: {
        w: 'majority'
    }
};

// 连接URI（添加更多连接参数）
const mongoURI = 'mongodb+srv://335846526:ysk123456@cluster0.ko0b4ty.mongodb.net/Database?retryWrites=true&w=majority&appName=Cluster0';

// 连接函数
async function connectToDatabase() {
    try {
        await mongoose.connect(mongoURI, mongoOptions);
        console.log('✅ MongoDB连接成功');
        
        // 连接事件监听
        mongoose.connection.on('error', (error) => {
            console.error('❌ MongoDB连接错误:', error);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB连接断开');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB重新连接成功');
        });
        
    } catch (error) {
        console.error('❌ MongoDB连接失败:', error.message);
        
        // 打印详细的错误信息和解决方案
        if (error.name === 'MongoServerSelectionError') {
            console.log('\n💡 MongoDB连接问题解决方案:');
            console.log('1. 检查网络连接');
            console.log('2. 确认MongoDB Atlas集群状态');
            console.log('3. 检查IP白名单设置');
            console.log('4. 验证用户名密码是否正确');
            console.log('5. 尝试重启应用程序');
        }
        
        // 重试连接
        console.log('🔄 5秒后尝试重新连接...');
        setTimeout(connectToDatabase, 5000);
    }
}

// 启动连接
connectToDatabase();

module.exports = mongoose;


