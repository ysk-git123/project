var express = require('express');
var router = express.Router();

var { userModel } = require('../../database/Login')
var { shopModel } = require('../../database/shop')
var JWT = require('jsonwebtoken')

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        console.log('登录请求:', { username, password: '***' });
        const user = await userModel.findOne({ username, password })
        console.log('完整用户数据:', user);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户不存在'
            })
        }

        // 生成双 Token
        const accessToken = JWT.sign(
            {
                userId: user._id,
                username: user.username,
            },
            'access_secret',
            { expiresIn: '15m' }
        );

        const refreshToken = JWT.sign(
            { userId: user._id },
            'refresh_secret',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: '登录成功',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    status: user.status,
                    image: user.image,
                    phone: user.phone,
                    email: user.email,
                    create_time: user.create_time
                },
                accessToken,
                refreshToken
            }
        })
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        })
    }
})


// 刷新令牌接口(无感刷新)
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: '刷新令牌不能为空'
            });
        }

        // 验证刷新令牌
        const decoded = JWT.verify(refreshToken, 'refresh_secret');
        const user = await userModel.findById(decoded.userId)

        if (!user || user.status === 0) {
            return res.status(401).json({
                success: false,
                message: '用户不存在或已被禁用'
            });
        }


        // 生成新的访问令牌
        const newAccessToken = JWT.sign(
            {
                userId: user._id,
                username: user.username,
                image: user.image,
                phone: user.phone,
                email: user.email,
                create_time: user.create_time
            },
            'access_secret',
            { expiresIn: '15m' }
        );

        res.json({
            success: true,
            message: '令牌刷新成功',
            data: {
                accessToken: newAccessToken
            }
        });

    } catch (error) {
        console.error('刷新令牌错误:', error);
        res.status(401).json({
            success: false,
            message: '刷新令牌无效'
        });
    }
});




// // 获取商品列表
// router.get('/shop', async (req, res) => {
//     try {
//         const { category, page = 1, pageSize = 10 } = req.query;
//         let query = {};

//         // 如果指定了分类，添加分类筛选条件
//         if (category && category !== 'all') {
//             query.category = category;
//         }

//         // 计算分页参数
//         const skip = (parseInt(page) - 1) * parseInt(pageSize);
//         const limit = parseInt(pageSize);

//         // 查询总数
//         const total = await shopModel.countDocuments(query);

//         // 查询分页数据
//         const data = await shopModel.find(query)
//             .sort({ _id: -1 })
//             .skip(skip)
//             .limit(limit);

//         res.json({
//             success: true,
//             message: '获取商品成功',
//             data: {
//                 list: data,
//                 pagination: {
//                     current: parseInt(page),
//                     pageSize: parseInt(pageSize),
//                     total: total,
//                     hasMore: skip + data.length < total
//                 }
//             }
//         });
//     } catch (error) {
//         console.error('获取商品错误:', error);
//         res.status(500).json({
//             success: false,
//             message: '获取商品失败'
//         });
//     }
// });


// 获取商品分类
router.get('/shop/categories', async (req, res) => {
    try {
        // 获取所有不重复的分类
        const categories = await shopModel.distinct('category');

        // 过滤掉空值和undefined
        const validCategories = categories.filter(cat => cat && cat.trim() !== '');

        // 按字母顺序排序
        const sortedCategories = validCategories.sort();

        console.log('获取到的分类:', sortedCategories);

        res.json({
            success: true,
            message: '获取分类成功',
            data: sortedCategories
        });
    } catch (error) {
        console.error('获取分类错误:', error);
        res.status(500).json({
            success: false,
            message: '获取分类失败'
        });
    }
});

// 添加商品
router.post('/shop', async (req, res) => {
    try {
        const { name, image, price, color, size, description, category } = req.body;

        // 验证必填字段
        if (!name || !image || !price || !category) {
            return res.status(400).json({
                success: false,
                message: '商品名称、图片、价格和分类为必填项'
            });
        }

        const newShop = new shopModel({
            name,
            image,
            price: parseFloat(price),
            color: color || [],
            size: size || [],
            description,
            category
        });

        await newShop.save();

        res.status(201).json({
            success: true,
            message: '添加商品成功',
            data: newShop
        });

    } catch (error) {
        console.error('添加商品错误:', error);
        res.status(500).json({
            success: false,
            message: '添加商品失败'
        });
    }
});

module.exports = router;