const { MongoClient } = require('mongodb');

// 订单号
const orderNo = 'ORDER_1755152801860_688f4f5867c0b21f6319ba5d';

async function checkOrderStatus() {
    try {
        // 连接数据库
        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        console.log('✅ 数据库连接成功');

        const db = client.db('rbac');
        
        // 检查简单订单集合
        console.log('\n🔍 检查orders集合...');
        const order = await db.collection('orders').findOne({ orderNo });
        if (order) {
            console.log('📋 简单订单信息:');
            console.log('   - 订单号:', order.orderNo);
            console.log('   - 用户名:', order.username);
            console.log('   - 金额:', order.amount);
            console.log('   - 状态:', order.status);
            console.log('   - 支付宝交易号:', order.alipayTradeNo);
            console.log('   - 创建时间:', order.createdAt);
            console.log('   - 更新时间:', order.updatedAt);
        } else {
            console.log('❌ 简单订单不存在');
        }

        // 检查详细订单集合
        console.log('\n🔍 检查orderdetails集合...');
        const orderDetail = await db.collection('orderdetails').findOne({ orderNo });
        if (orderDetail) {
            console.log('📋 详细订单信息:');
            console.log('   - 订单号:', orderDetail.orderNo);
            console.log('   - 状态:', orderDetail.status);
            console.log('   - 支付宝交易号:', orderDetail.alipayTradeNo);
            console.log('   - 创建时间:', orderDetail.createdAt);
            console.log('   - 更新时间:', orderDetail.updatedAt);
        } else {
            console.log('❌ 详细订单不存在');
        }

        // 搜索相似的订单号
        console.log('\n🔍 搜索相似的订单号...');
        const similarOrders = await db.collection('orders').find({
            orderNo: { $regex: 'ORDER_1755152801860' }
        }).toArray();
        
        if (similarOrders.length > 0) {
            console.log('📋 找到相似的订单:');
            similarOrders.forEach((order, index) => {
                console.log(`   ${index + 1}. 订单号: ${order.orderNo}, 状态: ${order.status}`);
            });
        } else {
            console.log('❌ 没有找到相似的订单');
        }

        // 搜索详细订单集合中的相似订单号
        const similarOrderDetails = await db.collection('orderdetails').find({
            orderNo: { $regex: 'ORDER_1755152801860' }
        }).toArray();
        
        if (similarOrderDetails.length > 0) {
            console.log('📋 找到相似的详细订单:');
            similarOrderDetails.forEach((order, index) => {
                console.log(`   ${index + 1}. 订单号: ${order.orderNo}, 状态: ${order.status}`);
            });
        } else {
            console.log('❌ 没有找到相似的详细订单');
        }

        await client.close();
        console.log('\n✅ 检查完成');

    } catch (error) {
        console.error('❌ 检查失败:', error);
    }
}

checkOrderStatus(); 