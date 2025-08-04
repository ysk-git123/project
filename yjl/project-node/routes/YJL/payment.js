const express = require('express');
const router = express.Router();
const { AlipaySdk } = require('alipay-sdk');
const mongoose = require('mongoose');

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
    return `SANDBOX_${Date.now()}_${userId}`;
}

// 订单模型定义
const orderSchema = new mongoose.Schema({
    orderNo: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    amount: { type: String, required: true },
    status: { type: String, default: 'pending' }, // pending, success, failed
    alipayTradeNo: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const orderModel = mongoose.model('Order', orderSchema);

// 健康检查
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'YJL支付服务正常运行' });
});

// 创建支付订单
router.get('/zf', async (req, res) => {
    try {
        const { username, amount = "38.88" } = req.query;
        
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
        const orderNo = generateOrderNo(userId);

        // 创建订单记录
        const order = new orderModel({
            orderNo,
            username,
            amount,
            status: 'pending'
        });
        await order.save();

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
            // 更新订单状态
            const order = await orderModel.findOne({ orderNo: out_trade_no });
            if (order) {
                order.status = 'success';
                order.alipayTradeNo = trade_no;
                order.updatedAt = new Date();
                await order.save();

                // 更新用户VIP状态
                const user = await userModel.findOne({ username: order.username });
                if (user) {
                    user.isvip = 'true';
                    user.updatedAt = new Date();
                    await user.save();
                }
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
            // 更新订单状态
            const order = await orderModel.findOne({ orderNo });
            if (order && order.status !== 'success') {
                order.status = 'success';
                order.alipayTradeNo = tradeNo;
                order.updatedAt = new Date();
                await order.save();

                // 更新用户VIP状态
                const user = await userModel.findOne({ username: order.username });
                if (user) {
                    user.isvip = 'true';
                    user.updatedAt = new Date();
                    await user.save();
                }

                console.log('支付成功处理完成:', {
                    orderNo,
                    amount,
                    alipayNo: tradeNo,
                    username: order.username
                });
            }
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

module.exports = router; 