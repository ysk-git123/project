const express = require('express');
const router = express.Router();
const { AlipaySdk } = require('alipay-sdk');
const mongoose = require('mongoose');
const path = require('path');
const { shopModel } = require(path.join(__dirname, '../../database/shop.js'));

// 调试信息
console.log('shopModel导入状态:', shopModel ? '成功' : '失败');
console.log('shopModel类型:', typeof shopModel);

// 用户模型定义
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    isvip: { type: String, default: 'false' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const userModel = mongoose.model('User', userSchema);

// 支付宝SDK配置
const alipaySdk = new AlipaySdk({
    appId: '2021000147673017',
    privateKey: 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCJl7MMChiRgZij7pSFTRn58MhrHt3Ei4bE0VVLk59M+PpVd0K0gN3sQDnTFIL6zEbSFYo37ndApvHkyHYXzBuPQMnAUHuHn3WGS+dFW3RwF6mNi45YYUr047i3EznDdN0Y1flrIB0iwr3VrrU0AbYS7wvgimikmxZaOhp2lFgPnzBwpatiaodmE283ORALNtHfsaRyXKtSGilIDzbwg1mstPosHd/FRcGFhejcOwKvensCXA4vczmxMm+YeXRhXh6moHZ9X2NICT7PrrD2SN1i3jglc7TwTpFcMi0ygLi3NJrxmVyyYCFS1hCWT/C8MJsnRmx+vb3m7lSaJt+B0enFAgMBAAECggEAGLtPz6Yw7FajHTRRNfS56pdBLyAJNL7vpokKD9+lDqziMmKRduiC+2g//JT/Rh1ZzYFZqtwOS2y2pizyLSze90zp9suAqMwcz9rs4yahM1TNgUfIelJiqsoT9bRa+asT4tbzUjIfipP+k14n7AUyuQyG0gGO9ad6yRUQlKftfEEYiB32ZPYWxj55T+0xcdHiQ7kwTjqURGbzdUXDH5gc+DQMTn80A/zT8bEQ6XvgVte3uyPKiYGwwgsd1ELaqAdaq6MFQw1kFdZxFzJ7hClyTlaCqTUcrV4vJAsHKWJYsbhvjcx0mZkDkup39URrEa7a+H2U3z3Vufav3/vRSqN4gQKBgQDdoqga/X1MFwiKCb7ldoY2HTcAfr4xc041VtfAX7Byp0MwtzgW0XnIsXBA0j66S3snnCpR/sRlnz0n4lHQSeODUQRtW+bPFS6JRhfjuiChA5pmOw1w/QtKK/lh7uM1A1TVTQ9kulIGtznS9wM5h1lAKSKM2a3lrcPdwro3nnZsTQKBgQCe7SSgaYX32J7xCNOVnAGfYC0wFzJI3ZjBhQ2ORG59T6hz87wXo4t5QHXqONJuZ9InnOG50J+nZTymY3jw9Z7iM6vWO8CSvNboWqhjj6xPrLL6V8Ixd8Oof4oAR9eJWfeP9dDDEp6jWHVSZ099cPPwsfrmwUEcdyLGUliMR2TPWQKBgQDIc5lIt+T/0YE2n3PYwubFwIyDVR4dSWT9luqRIbpLJ/377Gm9MX3MxrZ42e5DvYrIG1SnTh1Ar9G25dkK4hj0Jm0znz/UIRsyqoNmwmtKVSDqvxP8EdCJJ9Zn/Y/e3YF3XTfD6UPQsRyKMj/nYwOUpN+LtkCyDwOr6LdVIGuIrQKBgDCduqaXoTPAQF7bpF4P6y8l7KzZa7h+kUwht5Pduy76Pz25QcC5duEQpwGPgE/l0pPrmeGNwEkk3vjHVSfg+0mXJOnUPYSl39gUY46RVNTKr7WFQxJ+4Iua+Ew9reGGdATF3abO+1hcpwceM2LcOsNWrroIRDLA/xJL/mprLJuBAoGAUDiMtwXf25cc4pn0u4HnMVm2QdaNeSI+TZWhqN4sv+OKbqPKjqkLgg/8HyJaruWLxxwt6EaMPG/5SlX+merjmGTUg6jITX6sOlhjHJp1AVi5M1u541nqs7S8hu+y0+4jr9rIqnTtBQ4Ap2mOxWqRym5IueiqOKkKZ9DKQqSUohA=',
    alipayPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmA4Adf5Y9KHutvPgRbHRHSI3xrq74Q2clHRP1824/PY9cVBRzoorWxnCc/6BbUdBL3be5zrzzvBL9hh3unU5eyRhIKX9Msr/UZfuUPIrKJKmBuMohYDPzEZMKB66DdwoNzUyiIx7dB9ian6kZUet2hYvkXaN+aJ9e/ostu3SfWg7t22TBK5bwg9NQvt5hW7nL7IxuKZF3+hk4bQR79oErz/9HU5OF2N3sjUO00eClSlGqoME/bJ5POnwNvM9miveoTk6w18zqdASNFUrOonUwicI8o2ypvONuSbmf+RnEarnXe0VPhvuu9siMA5WxudJs2l+mjxt99DYBbQZmI26HQIDAQAB',
    gateway: "https://openapi-sandbox.dl.alipaydev.com/gateway.do",
});

// 生成订单号
function generateOrderNo(userId) {
    return `ORDER_${Date.now()}_${userId}`;
}

// 订单模型定义
const orderSchema = new mongoose.Schema({
    orderNo: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    merchantCode: { type: String, required: true }, // 添加merchantCode字段
    amount: { type: String, required: true },
    status: { type: String, default: 'pending' }, // pending, success, failed
    alipayTradeNo: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const orderModel = mongoose.model('Order', orderSchema);

// 订单详情模型定义
const orderDetailSchema = new mongoose.Schema({
    orderNo: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    userId: { type: String, required: true },
    merchantCode: { type: String, required: true }, // 添加merchantCode字段
    items: [{
        id: String,
        name: String,
        price: Number,
        image: String,
        color: String,
        size: String,
        quantity: Number
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    address: {
        recipient: String,
        phone: String,
        province: String,
        city: String,
        district: String,
        detail: String
    },
    paymentMethod: String,
    message: String,
    alipayTradeNo: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const orderDetailModel = mongoose.model('OrderDetail', orderDetailSchema);

// 创建完整订单记录
router.post('/create-order', async (req, res) => {
    try {
        const { userId, username, merchantCode, items, totalAmount, address, paymentMethod, message } = req.body;
        
        if (!username || !merchantCode || !items || !totalAmount) {
            return res.status(400).json({
                code: 400,
                message: '订单信息不完整'
            });
        }

        const orderNo = generateOrderNo(userId);

        // 创建详细订单记录
        const orderDetail = new orderDetailModel({
            orderNo,
            username,
            userId,
            merchantCode,
            items,
            totalAmount,
            address,
            paymentMethod,
            message: message || '',
            status: 'pending'
        });

        await orderDetail.save();

        res.json({
            code: 200,
            data: {
                orderNo,
                orderId: orderDetail._id
            },
            message: '订单创建成功'
        });

    } catch (error) {
        console.error('创建订单失败:', error);
        res.status(500).json({
            code: 500,
            message: '创建订单失败',
            error: error.message
        });
    }
});

// 健康检查
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'YJL支付服务正常运行' });
});

// 创建支付订单
router.get('/zf', async (req, res) => {
    try {
        const { username, amount = "38.88", orderNo: existingOrderNo } = req.query;
        
        if (!username) {
            return res.status(400).json({
                code: 400,
                message: '用户名不能为空'
            });
        }

        // 查找或创建用户
        let user = await userModel.findOne({ username });
        if (!user) {
            user = new userModel({ username });
            await user.save();
        }

        console.log('支付请求参数:', req.query);

        const userId = username;
        const orderNo = existingOrderNo || generateOrderNo(userId);

        // 如果提供了已存在的订单号，检查是否已存在
        if (existingOrderNo) {
            const existingOrder = await orderModel.findOne({ orderNo: existingOrderNo });
            if (existingOrder) {
                console.log('使用已存在的订单号:', existingOrderNo);
            } else {
                // 创建订单记录
                const order = new orderModel({
                    orderNo,
                    username,
                    merchantCode: user.merchantCode || 'MER001',
                    amount,
                    status: 'pending'
                });
                await order.save();
                console.log('为已存在的详细订单创建简单订单记录:', orderNo);
            }
        } else {
            // 创建订单记录
            const order = new orderModel({
                orderNo,
                username,
                merchantCode: user.merchantCode || 'MER001',
                amount,
                status: 'pending'
            });
            await order.save();
            console.log('创建新的订单记录:', orderNo);
        }

        const orderParams = {
            bizContent: {
                out_trade_no: orderNo,
                total_amount: amount,
                subject: "交付界面",
                product_code: "QUICK_WAP_WAY",
                quit_url: "http://localhost:3000/YJL/payment/cancel",
                notify_url: "http://localhost:3000/YJL/payment/notify",
                return_url: "http://localhost:3000/YJL/payment/success"
            },
        };

        const result = await alipaySdk.pageExec('alipay.trade.wap.pay', {
            method: 'GET',
            bizContent: orderParams.bizContent,
            notifyUrl: orderParams.bizContent.notify_url,
            returnUrl: orderParams.bizContent.return_url
        });

        console.log('支付宝返回结果:', result);

        res.json({
            code: 200,
            message: '支付订单创建成功',
            data: {
                orderNo,
                payUrl: result
            }
        });

    } catch (error) {
        console.error('支付宝接口错误:', error);
        res.status(500).json({
            code: 500,
            message: '支付请求失败',
            error: error.message
        });
    }
});

// 支付成功回调页面
router.get('/payment/success', async (req, res) => {
    try {
        const { out_trade_no, trade_no, total_amount } = req.query;
        
        console.log('支付成功回调:', req.query);

        if (out_trade_no) {
            // 更新简单订单状态
            const order = await orderModel.findOne({ orderNo: out_trade_no });
            if (order) {
                order.status = 'success';
                order.alipayTradeNo = trade_no;
                order.updatedAt = new Date();
                await order.save();
            }

            // 更新详细订单状态
            const orderDetail = await orderDetailModel.findOne({ orderNo: out_trade_no });
            if (orderDetail) {
                orderDetail.status = 'shipped'; // 支付成功后直接变为已发货状态
                orderDetail.alipayTradeNo = trade_no;
                orderDetail.updatedAt = new Date();
                await orderDetail.save();
                console.log('详细订单状态已更新为已发货:', out_trade_no);
            }

            // 更新用户VIP状态
            const userToUpdate = await userModel.findOne({ username: order?.username });
            if (userToUpdate) {
                userToUpdate.isvip = 'true';
                userToUpdate.updatedAt = new Date();
                await userToUpdate.save();
            }
        }

        // 返回成功页面或重定向到前端
        res.send(`
            <html>
                <head>
                    <title>支付成功</title>
                    <meta charset="utf-8">
                </head>
                <body>
                    <div style="text-align: center; padding: 50px;">
                        <h1>✅ 支付成功！</h1>
                        <p>订单号: ${out_trade_no}</p>
                        <p>支付金额: ¥${total_amount}</p>
                        <p>订单状态: 待发货</p>
                        <button onclick="window.close()">关闭页面</button>
                        <script>
                            setTimeout(() => {
                                window.close();
                            }, 3000);
                        </script>
                    </div>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('处理支付成功回调失败:', error);
        res.status(500).send('处理支付结果失败');
    }
});

// 支付取消页面
router.get('/payment/cancel', (req, res) => {
    console.log('支付取消回调:', req.query);
    res.send(`
        <html>
            <head>
                <title>支付取消</title>
                <meta charset="utf-8">
            </head>
            <body>
                <div style="text-align: center; padding: 50px;">
                    <h1>⚠️ 支付已取消</h1>
                    <p>您可以重新尝试支付</p>
                    <button onclick="window.close()">关闭页面</button>
                </div>
            </body>
        </html>
    `);
});

// 支付宝异步通知
router.post('/payment/notify', async (req, res) => {
    try {
        console.log('收到支付宝异步通知:', req.body);
        
        const params = req.body;

        // 验证签名
        const signVerified = alipaySdk.checkNotifySign(params);

        if (!signVerified) {
            console.error('签名验证失败');
            return res.status(400).send('invalid signature');
        }

        const tradeStatus = params.trade_status;
        const orderNo = params.out_trade_no;
        const tradeNo = params.trade_no;
        const amount = params.total_amount;

        console.log('支付状态:', tradeStatus);

        if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
            // 更新简单订单状态
            const order = await orderModel.findOne({ orderNo });
            if (order && order.status !== 'success') {
                order.status = 'success';
                order.alipayTradeNo = tradeNo;
                order.updatedAt = new Date();
                await order.save();
            }

            // 更新详细订单状态
            const orderDetail = await orderDetailModel.findOne({ orderNo });
            if (orderDetail && orderDetail.status === 'pending') {
                orderDetail.status = 'shipped'; // 支付成功后直接变为已发货状态
                orderDetail.alipayTradeNo = tradeNo;
                orderDetail.updatedAt = new Date();
                await orderDetail.save();
                console.log('详细订单状态已更新为已发货:', orderNo);
            }

            // 更新用户VIP状态
            const user = await userModel.findOne({ username: order?.username });
            if (user) {
                user.isvip = 'true';
                user.updatedAt = new Date();
                await user.save();
            }

            console.log('支付成功处理完成:', {
                orderNo,
                amount,
                alipayNo: tradeNo,
                username: order?.username
            });
        }

        res.send('success');
    } catch (error) {
        console.error('处理支付宝异步通知失败:', error);
        res.status(500).send('error');
    }
});

// 查询订单状态
router.get('/order/status/:orderNo', async (req, res) => {
    try {
        const { orderNo } = req.params;
        const order = await orderModel.findOne({ orderNo });
        
        if (!order) {
            return res.status(404).json({
                code: 404,
                message: '订单不存在'
            });
        }

        res.json({
            code: 200,
            data: {
                orderNo: order.orderNo,
                username: order.username,
                amount: order.amount,
                status: order.status,
                alipayTradeNo: order.alipayTradeNo,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }
        });
    } catch (error) {
        console.error('查询订单状态失败:', error);
        res.status(500).json({
            code: 500,
            message: '查询失败',
            error: error.message
        });
    }
});

// 查询用户信息
router.get('/user/info/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await userModel.findOne({ username });
        
        if (!user) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在'
            });
        }

        res.json({
            code: 200,
            data: {
                username: user.username,
                isvip: user.isvip,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('查询用户信息失败:', error);
        res.status(500).json({
            code: 500,
            message: '查询失败',
            error: error.message
        });
    }
});

// 查询用户订单列表
router.get('/orders/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        // 获取用户的merchantCode
        const user = await userModel.findOne({ username });
        if (!user) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在'
            });
        }
        
        const merchantCode = user.merchantCode || 'MER001';
        
        // 首先尝试从详细订单表获取，根据merchantCode过滤
        let orders = await orderDetailModel.find({ 
            username, 
            merchantCode 
        }).sort({ createdAt: -1 });
        
        if (orders.length === 0) {
            // 如果没有详细订单，从简单订单表获取，根据merchantCode过滤
            const simpleOrders = await orderModel.find({ 
                username, 
                merchantCode 
            }).sort({ createdAt: -1 });
            
            // 转换为前端需要的格式，从商品数据库获取真实商品信息
            orders = await Promise.all(simpleOrders.map(async (order) => {
                try {
                    // 从商品数据库获取商品信息
                    const product = shopModel ? await shopModel.findOne({}).limit(1) : null;
                    
                    return {
                        _id: order._id,
                        orderNo: order.orderNo,
                        username: order.username,
                        userId: order.username,
                        items: [{
                            id: product ? product._id.toString() : 'item1',
                            name: product ? product.name : '商品名称',
                            price: parseFloat(order.amount),
                            image: product ? product.image : '/img/car1.jpg',
                            color: product && product.color && product.color.length > 0 ? product.color[0] : '默认',
                            size: product && product.size && product.size.length > 0 ? product.size[0] : '默认',
                            quantity: 1
                        }],
                        totalAmount: parseFloat(order.amount),
                        status: order.status,
                        address: {
                            recipient: '收货人',
                            phone: '13800138000',
                            province: '北京市',
                            city: '北京市',
                            district: '朝阳区',
                            detail: '详细地址'
                        },
                        paymentMethod: '支付宝',
                        createdAt: order.createdAt,
                        updatedAt: order.updatedAt
                    };
                } catch (error) {
                    console.error('处理订单商品信息失败:', error);
                    // 如果获取商品信息失败，使用默认数据
                    return {
                        _id: order._id,
                        orderNo: order.orderNo,
                        username: order.username,
                        userId: order.username,
                        items: [{
                            id: 'item1',
                            name: '商品名称',
                            price: parseFloat(order.amount),
                            image: '/img/car1.jpg',
                            color: '默认',
                            size: '默认',
                            quantity: 1
                        }],
                        totalAmount: parseFloat(order.amount),
                        status: order.status,
                        address: {
                            recipient: '收货人',
                            phone: '13800138000',
                            province: '北京市',
                            city: '北京市',
                            district: '朝阳区',
                            detail: '详细地址'
                        },
                        paymentMethod: '支付宝',
                        createdAt: order.createdAt,
                        updatedAt: order.updatedAt
                    };
                }
            }));
        }
        
        // 转换为前端需要的格式
        const formattedOrders = await Promise.all(orders.map(async (order) => {
            try {
                console.log('处理订单:', {
                    _id: order._id,
                    status: order.status,
                    mappedStatus: mapOrderStatus(order.status)
                });
                
                // 如果订单没有商品信息，从商品数据库获取
                let items = order.items;
                if (!items || items.length === 0) {
                    const product = shopModel ? await shopModel.findOne({}).limit(1) : null;
                    items = [{
                        id: product ? product._id.toString() : 'item1',
                        name: product ? product.name : '商品名称',
                        price: order.totalAmount || parseFloat(order.amount || 0),
                        image: product ? product.image : '/img/car1.jpg',
                        color: product && product.color && product.color.length > 0 ? product.color[0] : '默认',
                        size: product && product.size && product.size.length > 0 ? product.size[0] : '默认',
                        quantity: 1
                    }];
                }
                
                return {
                    _id: order._id.toString(),
                    orderNo: order.orderNo,
                    userId: order.userId,
                    items: items,
                    totalAmount: order.totalAmount || parseFloat(order.amount || 0),
                    status: mapOrderStatus(order.status),
                    createdAt: order.createdAt.toLocaleString('zh-CN'),
                    updatedAt: order.updatedAt.toLocaleString('zh-CN'),
                    address: order.address || {
                        recipient: '收货人',
                        phone: '13800138000',
                        province: '北京市',
                        city: '北京市',
                        district: '朝阳区',
                        detail: '详细地址'
                    },
                    paymentMethod: order.paymentMethod || '支付宝'
                };
            } catch (error) {
                console.error('处理订单格式化失败:', error);
                // 如果处理失败，返回基本订单信息
                return {
                    _id: order._id.toString(),
                    orderNo: order.orderNo,
                    userId: order.userId,
                    items: [{
                        id: 'item1',
                        name: '商品名称',
                        price: order.totalAmount || parseFloat(order.amount || 0),
                        image: '/img/car1.jpg',
                        color: '默认',
                        size: '默认',
                        quantity: 1
                    }],
                    totalAmount: order.totalAmount || parseFloat(order.amount || 0),
                    status: mapOrderStatus(order.status),
                    createdAt: order.createdAt.toLocaleString('zh-CN'),
                    updatedAt: order.updatedAt.toLocaleString('zh-CN'),
                    address: order.address || {
                        recipient: '收货人',
                        phone: '13800138000',
                        province: '北京市',
                        city: '北京市',
                        district: '朝阳区',
                        detail: '详细地址'
                    },
                    paymentMethod: order.paymentMethod || '支付宝'
                };
            }
        }));

        res.json({
            code: 200,
            data: formattedOrders,
            message: '获取订单列表成功'
        });
    } catch (error) {
        console.error('查询订单列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '查询失败',
            error: error.message
        });
    }
});

// 获取用户订单统计信息
router.get('/orders/stats/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        // 获取用户的merchantCode
        const user = await userModel.findOne({ username });
        if (!user) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在'
            });
        }
        
        const merchantCode = user.merchantCode || 'MER001';
        
        // 根据merchantCode查询订单统计
        const pendingCount = await orderDetailModel.countDocuments({ 
            username, 
            merchantCode, 
            status: 'pending' 
        });
        
        const processingCount = await orderDetailModel.countDocuments({ 
            username, 
            merchantCode, 
            status: 'processing' 
        });
        
        const shippedCount = await orderDetailModel.countDocuments({ 
            username, 
            merchantCode, 
            status: 'shipped' 
        });
        
        const completedCount = await orderDetailModel.countDocuments({ 
            username, 
            merchantCode, 
            status: 'completed' 
        });
        
        res.json({
            code: 200,
            data: {
                pending: pendingCount,
                processing: processingCount,
                shipped: shippedCount,
                completed: completedCount
            },
            message: '获取订单统计成功'
        });
    } catch (error) {
        console.error('获取订单统计失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取订单统计失败',
            error: error.message
        });
    }
});

// 获取订单详情
router.get('/order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { username } = req.query; // 从查询参数获取用户名
        
        if (!username) {
            return res.status(400).json({
                code: 400,
                message: '缺少用户名参数'
            });
        }
        
        // 获取用户的merchantCode
        const user = await userModel.findOne({ username });
        if (!user) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在'
            });
        }
        
        const merchantCode = user.merchantCode || 'MER001';
        
        // 首先尝试从详细订单表获取，验证merchantCode
        let order = await orderDetailModel.findOne({ 
            _id: orderId, 
            merchantCode 
        });
        
        if (!order) {
            // 如果没有详细订单，从简单订单表获取，验证merchantCode
            order = await orderModel.findOne({ 
                _id: orderId, 
                merchantCode 
            });
            
            if (!order) {
                return res.status(404).json({
                    code: 404,
                    message: '订单不存在或无权限访问'
                });
            }
            
            // 转换为前端需要的格式
            const product = await shopModel.findOne({}).limit(1);
            order = {
                _id: order._id,
                orderNo: order.orderNo,
                username: order.username,
                userId: order.username,
                items: [{
                    id: product ? product._id.toString() : 'item1',
                    name: product ? product.name : '商品名称',
                    price: parseFloat(order.amount),
                    image: product ? product.image : '/img/car1.jpg',
                    color: product && product.color && product.color.length > 0 ? product.color[0] : '默认',
                    size: product && product.size && product.size.length > 0 ? product.size[0] : '默认',
                    quantity: 1
                }],
                totalAmount: parseFloat(order.amount),
                status: order.status,
                address: {
                    recipient: '收货人',
                    phone: '13800138000',
                    province: '北京市',
                    city: '北京市',
                    district: '朝阳区',
                    detail: '详细地址'
                },
                paymentMethod: '支付宝',
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            };
        }
        
        // 转换为前端需要的格式
        let items = order.items;
        if (!items || items.length === 0) {
            const product = await shopModel.findOne({}).limit(1);
            items = [{
                id: product ? product._id.toString() : 'item1',
                name: product ? product.name : '商品名称',
                price: order.totalAmount || parseFloat(order.amount || 0),
                image: product ? product.image : '/img/car1.jpg',
                color: product && product.color && product.color.length > 0 ? product.color[0] : '默认',
                size: product && product.size && product.size.length > 0 ? product.size[0] : '默认',
                quantity: 1
            }];
        }
        
        const formattedOrder = {
            id: order._id.toString(),
            orderNumber: order.orderNo,
            userId: order.userId,
            items: items,
            totalAmount: order.totalAmount || parseFloat(order.amount || 0),
            status: mapOrderStatus(order.status),
            createTime: order.createdAt.toLocaleString('zh-CN'),
            paymentTime: order.status === 'success' ? order.updatedAt.toLocaleString('zh-CN') : undefined,
            shippingTime: order.status === 'shipped' ? order.updatedAt.toLocaleString('zh-CN') : undefined,
            deliveryTime: order.status === 'received' ? order.updatedAt.toLocaleString('zh-CN') : undefined,
            address: order.address || {
                recipient: '收货人',
                phone: '13800138000',
                province: '北京市',
                city: '北京市',
                district: '朝阳区',
                detail: '详细地址'
            },
            paymentMethod: order.paymentMethod || '支付宝',
            message: order.message || ''
        };

        res.json({
            code: 200,
            data: formattedOrder,
            message: '获取订单详情成功'
        });
    } catch (error) {
        console.error('获取订单详情失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取订单详情失败',
            error: error.message
        });
    }
});

// 取消订单
router.post('/order/cancel/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        console.log('取消订单请求，订单ID:', orderId);
        
        // 首先尝试从详细订单表获取
        let order = await orderDetailModel.findById(orderId);
        let isDetailOrder = true;
        
        if (!order) {
            // 如果没有详细订单，从简单订单表获取
            order = await orderModel.findById(orderId);
            isDetailOrder = false;
            
            if (!order) {
                console.log('订单不存在:', orderId);
                return res.status(404).json({
                    code: 404,
                    message: '订单不存在'
                });
            }
        }

        console.log('找到订单:', {
            id: order._id,
            status: order.status,
            isDetailOrder
        });

        // 检查订单状态是否允许取消
        if (order.status !== 'pending' && order.status !== 'pending_payment' && order.status !== 'processing' && order.status !== 'paid') {
            console.log('订单状态不允许取消:', order.status);
            return res.status(400).json({
                code: 400,
                message: `订单状态不允许取消，当前状态: ${order.status}`
            });
        }

        // 更新订单状态
        order.status = 'cancelled';
        order.updatedAt = new Date();
        await order.save();

        console.log('订单取消成功:', orderId);
        res.json({
            code: 200,
            message: '订单取消成功'
        });
    } catch (error) {
        console.error('取消订单失败:', error);
        res.status(500).json({
            code: 500,
            message: '取消失败',
            error: error.message
        });
    }
});

// 确认收货
router.post('/order/confirm/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        console.log('确认收货请求，订单ID:', orderId);
        
        // 首先尝试从详细订单表获取
        let order = await orderDetailModel.findById(orderId);
        let isDetailOrder = true;
        
        if (!order) {
            console.log('详细订单表中未找到订单，尝试简单订单表');
            // 如果没有详细订单，从简单订单表获取
            order = await orderModel.findById(orderId);
            isDetailOrder = false;
            
            if (!order) {
                console.log('简单订单表中也未找到订单');
                return res.status(404).json({
                    code: 404,
                    message: '订单不存在'
                });
            }
        }
        
        console.log('找到订单:', {
            id: order._id,
            orderNo: order.orderNo,
            status: order.status,
            isDetailOrder
        });

        // 检查订单状态是否允许确认收货
        if (order.status !== 'shipped' && order.status !== 'success') {
            return res.status(400).json({
                code: 400,
                message: '订单状态不允许确认收货'
            });
        }

        // 更新订单状态：直接从已发货变为已收货
        order.status = 'received';
        order.updatedAt = new Date();
        await order.save();

        const statusMessage = '确认收货成功，订单状态已更新为已收货';
        
        res.json({
            code: 200,
            message: statusMessage,
            data: {
                newStatus: order.status
            }
        });
    } catch (error) {
        console.error('确认收货失败:', error);
        res.status(500).json({
            code: 500,
            message: '确认收货失败',
            error: error.message
        });
    }
});

// 删除订单
router.delete('/order/delete/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        console.log('删除订单请求，订单ID:', orderId);
        
        // 首先尝试从详细订单表获取
        let order = await orderDetailModel.findById(orderId);
        let isDetailOrder = true;
        
        if (!order) {
            // 如果没有详细订单，从简单订单表获取
            order = await orderModel.findById(orderId);
            isDetailOrder = false;
            
            if (!order) {
                console.log('订单不存在:', orderId);
                return res.status(404).json({
                    code: 404,
                    message: '订单不存在'
                });
            }
        }

        console.log('找到订单:', {
            id: order._id,
            status: order.status,
            isDetailOrder
        });

        // 检查订单状态是否允许删除（只有已取消的订单才能删除）
        if (order.status !== 'cancelled') {
            console.log('订单状态不允许删除:', order.status);
            return res.status(400).json({
                code: 400,
                message: `只有已取消的订单才能删除，当前状态: ${order.status}`
            });
        }

        // 删除订单
        if (isDetailOrder) {
            await orderDetailModel.findByIdAndDelete(orderId);
        } else {
            await orderModel.findByIdAndDelete(orderId);
        }

        console.log('订单删除成功:', orderId);
        res.json({
            code: 200,
            message: '订单删除成功'
        });
    } catch (error) {
        console.error('删除订单失败:', error);
        res.status(500).json({
            code: 500,
            message: '删除失败',
            error: error.message
        });
    }
});

// 手动更新订单状态（用于修复已支付但状态未更新的订单）
router.put('/order/update-status/:orderNo', async (req, res) => {
    try {
        const { orderNo } = req.params;
        const { status } = req.body;
        
        console.log('手动更新订单状态:', { orderNo, status });

        // 更新简单订单状态
        const order = await orderModel.findOne({ orderNo });
        if (order) {
            order.status = status;
            order.updatedAt = new Date();
            await order.save();
            console.log('简单订单状态已更新:', orderNo);
        }

        // 更新详细订单状态
        const orderDetail = await orderDetailModel.findOne({ orderNo });
        if (orderDetail) {
            orderDetail.status = status;
            orderDetail.updatedAt = new Date();
            await orderDetail.save();
            console.log('详细订单状态已更新:', orderNo);
        }

        res.json({
            code: 200,
            message: '订单状态更新成功',
            data: {
                orderNo,
                status
            }
        });
    } catch (error) {
        console.error('更新订单状态失败:', error);
        res.status(500).json({
            code: 500,
            message: '更新失败',
            error: error.message
        });
    }
});

// 订单状态映射函数
function mapOrderStatus(backendStatus) {
    console.log('后端状态映射:', backendStatus);
    const statusMap = {
        'pending': 'pending_payment',
        'processing': 'paid',  // 添加processing状态映射
        'success': 'paid',
        'shipped': 'shipped',
        'received': 'received',
        'cancelled': 'cancelled',
        'failed': 'payment_failed'
    };
    const mappedStatus = statusMap[backendStatus] || 'pending_payment';
    console.log('映射后状态:', mappedStatus);
    return mappedStatus;
}

module.exports = router; 