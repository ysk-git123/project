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




// 获取商品列表
router.get('/shop', async (req, res) => {
    try {
        const { category, page = 1, pageSize = 10, search = '' } = req.query;
        let query = {};

        // 如果指定了分类，添加分类筛选条件
        if (category && category !== 'all') {
            query.category = category;
        }

        // 如果指定了搜索关键词，添加搜索条件
        if (search && search.trim() !== '') {
            query.name = { $regex: search.trim(), $options: 'i' }; // 不区分大小写的模糊搜索
        }

        // 计算分页参数
        const skip = (parseInt(page) - 1) * parseInt(pageSize);
        const limit = parseInt(pageSize);

        // 查询总数
        const total = await shopModel.countDocuments(query);

        // 查询分页数据
        const data = await shopModel.find(query)
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            message: '获取商品成功',
            data: {
                list: data,
                pagination: {
                    current: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total: total,
                    hasMore: skip + data.length < total
                }
            }
        });
    } catch (error) {
        console.error('获取商品错误:', error);
        res.status(500).json({
            success: false,
            message: '获取商品失败'
        });
    }
});


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

<<<<<<< HEAD
// 获取商品列表
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

//         // 添加调试日志
//         console.log('=== 商品查询信息 ===');
//         console.log('请求参数:', { category, page, pageSize });
//         console.log('查询条件:', query);
//         console.log('查询结果:', { total, dataLength: data.length });

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
=======
// 获取用户信息
router.get('/user/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: '未提供访问令牌'
            });
        }

        const decoded = JWT.verify(token, 'access_secret');
        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        res.json({
            success: true,
            message: '获取用户信息成功',
            data: {
                id: user._id,
                username: user.username,
                status: user.status,
                image: user.image,
                phone: user.phone,
                email: user.email,
                create_time: user.create_time
            }
        });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(401).json({
            success: false,
            message: '令牌无效或已过期'
        });
    }
});
>>>>>>> 41d93645c1903b38511f87893e93560c00548a78

// 更新用户信息
router.put('/user/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: '未提供访问令牌'
            });
        }

        const decoded = JWT.verify(token, 'access_secret');
        const { username, phone, email, image } = req.body;

        // 验证用户名是否已存在（排除当前用户）
        if (username) {
            const existingUser = await userModel.findOne({ 
                username, 
                _id: { $ne: decoded.userId } 
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: '用户名已存在'
                });
            }
        }

        // 验证手机号是否已存在（排除当前用户）
        if (phone) {
            const existingUser = await userModel.findOne({ 
                phone, 
                _id: { $ne: decoded.userId } 
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: '手机号已存在'
                });
            }
        }

        // 验证邮箱是否已存在（排除当前用户）
        if (email) {
            const existingUser = await userModel.findOne({ 
                email, 
                _id: { $ne: decoded.userId } 
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: '邮箱已存在'
                });
            }
        }

        // 更新用户信息
        const updateData = {};
        if (username) updateData.username = username;
        if (phone) updateData.phone = phone;
        if (email) updateData.email = email;
        if (image) updateData.image = image;

        const updatedUser = await userModel.findByIdAndUpdate(
            decoded.userId,
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        res.json({
            success: true,
            message: '更新用户信息成功',
            data: {
                id: updatedUser._id,
                username: updatedUser.username,
                status: updatedUser.status,
                image: updatedUser.image,
                phone: updatedUser.phone,
                email: updatedUser.email,
                create_time: updatedUser.create_time
            }
        });
    } catch (error) {
        console.error('更新用户信息错误:', error);
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({
                success: false,
                message: '令牌无效'
            });
        } else {
            res.status(500).json({
                success: false,
                message: '服务器错误'
            });
        }
    }
});

module.exports = router;