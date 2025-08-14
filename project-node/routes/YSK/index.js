const express = require('express');
const router = express.Router();
const JWT = require('jsonwebtoken');
const { userModel } = require('../../database/Login');
const { shopModel } = require('../../database/shop');
const mongoose = require('mongoose');
const authConfig = require('../../middlewarelzy/authConfig');
const verifyAccessToken = require('../../middlewarelzy/verifyAccessToken');


// 购物车模型
const cartSchema = new mongoose.Schema({
    merchantCode: { type: String, required: true },
    userId: { type: String, required: true },
    items: [{
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        color: { type: String, required: true },
        size: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const CartModel = mongoose.model('Cart', cartSchema);

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
            authConfig.secrets.accessToken,
            { expiresIn: authConfig.expiresIn.accessToken }
        );

        const refreshToken = JWT.sign(
            { userId: user._id },
            authConfig.secrets.refreshToken,
            { expiresIn: authConfig.expiresIn.refreshToken }
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
                    create_time: user.create_time,
                    merchantCode: user.merchantCode
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
        const decoded = JWT.verify(refreshToken, authConfig.secrets.refreshToken);
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
            authConfig.secrets.accessToken,
            { expiresIn: authConfig.expiresIn.accessToken }
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


// 获取商品分类（使用统一认证中间件）
router.get('/shop/categories', verifyAccessToken, async (req, res) => {
    try {
        // 从请求对象中获取用户信息（由认证中间件提供）
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户未认证'
            });
        }

        // 获取所有不重复的分类
        const categories = await shopModel.distinct('category');

        // 过滤掉空值和undefined
        const validCategories = categories.filter(cat => cat && cat.trim() !== '');

        // 按字母顺序排序
        const sortedCategories = validCategories.sort();

        res.json({
            success: true,
            message: '获取分类成功',
            data: sortedCategories
        });
    } catch (error) {
        console.error('获取分类错误:', error);
        
        // 处理JWT相关错误
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: '登录已过期，请重新登录',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: '登录凭证无效，请重新登录',
                code: 'TOKEN_INVALID'
            });
        }
        
        // 其他错误返回500
        res.status(500).json({
            success: false,
            message: '获取分类失败',
            code: 'INTERNAL_ERROR'
        });
    }
});

// ==================== 商品审核相关API ====================

// 获取审核商品列表
router.get('/audit-products', verifyAccessToken, async (req, res) => {
    try {
        const { page = 1, pageSize = 10, status, category, search } = req.query;
        
        // 从认证中间件获取用户信息
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户未认证'
            });
        }

        // 构建查询条件 - 兼容现有数据
        let query = {};
        
        // 如果用户有merchantCode，则按merchantCode筛选
        if (user.merchantCode) {
            query.merchantCode = user.merchantCode;
        }
        
        if (status && status !== '') {
            query.status = status;
        }
        
        if (category && category !== '') {
            query.category = category;
        }
        
        if (search && search !== '') {
            query.name = { $regex: search, $options: 'i' };
        }

        // 分页查询
        const skip = (parseInt(page) - 1) * parseInt(pageSize);
        const auditProducts = await shopModel.find(query)
            .sort({ createTime: -1 })
            .skip(skip)
            .limit(parseInt(pageSize));

        const total = await shopModel.countDocuments(query);

        res.json({
            success: true,
            message: '获取审核商品列表成功',
            data: {
                list: auditProducts,
                pagination: {
                    current: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total: total
                }
            }
        });
    } catch (error) {
        console.error('获取审核商品列表错误:', error);
        
        // 返回500错误
        res.status(500).json({
            success: false,
            message: '获取审核商品列表失败',
            code: 'INTERNAL_ERROR'
        });
    }
});

// 审核商品（通过/拒绝）
router.put('/audit-products/:productId', verifyAccessToken, async (req, res) => {
    try {
        const { productId } = req.params;
        const { action, reason } = req.body; // action: 'approve' 或 'reject'
        
        // 从认证中间件获取用户信息
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户未认证'
            });
        }

        const product = await shopModel.findById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: '商品不存在'
            });
        }

        // 检查权限（只有管理员或商品所有者可以审核）
        if (user.role !== 'admin' && product.merchantCode !== user.merchantCode) {
            return res.status(403).json({
                success: false,
                message: '无权操作此商品'
            });
        }

        // 更新商品状态
        if (action === 'approve') {
            product.status = 'approved';
            product.auditTime = new Date();
            product.auditor = user.username;
        } else if (action === 'reject') {
            product.status = 'rejected';
            product.rejectReason = reason;
            product.auditTime = new Date();
            product.auditor = user.username;
        }

        await product.save();

        res.json({
            success: true,
            message: action === 'approve' ? '商品审核通过' : '商品审核拒绝',
            data: product
        });
    } catch (error) {
        console.error('审核商品错误:', error);
        res.status(500).json({
            success: false,
            message: '审核商品失败'
        });
    }
});

// 重新提交商品审核
router.put('/resubmit-products/:productId', verifyAccessToken, async (req, res) => {
    try {
        const { productId } = req.params;
        
        // 从认证中间件获取用户信息
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户未认证'
            });
        }

        const product = await shopModel.findById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: '商品不存在'
            });
        }

        // 检查权限（只有商品所有者可以重新提交）
        if (product.merchantCode !== user.merchantCode) {
            return res.status(403).json({
                success: false,
                message: '无权操作此商品'
            });
        }

        // 重置为待审核状态
        product.status = 'pending';
        product.rejectReason = undefined;
        product.auditTime = undefined;
        product.auditor = undefined;

        await product.save();

        res.json({
            success: true,
            message: '商品重新提交审核成功',
            data: product
        });
    } catch (error) {
        console.error('重新提交商品审核错误:', error);
        res.status(500).json({
            success: false,
            message: '重新提交商品审核失败'
        });
    }
});

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
                create_time: user.create_time,
                merchantCode: user.merchantCode
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

// 获取购物车
router.get('/cart', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: '未提供访问令牌'
            });
        }

        let decoded;
        try {
            decoded = JWT.verify(token, 'access_secret');
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: '访问令牌已过期，请重新登录',
                    code: 'TOKEN_EXPIRED'
                });
            }
            return res.status(401).json({
                success: false,
                message: '无效的访问令牌'
            });
        }

        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户不存在'
            });
        }

        // 根据用户的merchantCode查找购物车
        let cart = await CartModel.findOne({
            merchantCode: user.merchantCode,
            userId: user._id.toString()
        });

        if (!cart) {
            // 如果购物车不存在，创建一个空的购物车
            cart = new CartModel({
                merchantCode: user.merchantCode,
                userId: user._id.toString(),
                items: []
            });
            await cart.save();
        }

        res.json({
            success: true,
            message: '获取购物车成功',
            data: cart.items
        });
    } catch (error) {
        console.error('获取购物车错误:', error);
        res.status(500).json({
            success: false,
            message: '获取购物车失败'
        });
    }
});

// 添加商品到购物车
router.post('/cart/add', async (req, res) => {
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
            return res.status(401).json({
                success: false,
                message: '用户不存在'
            });
        }

        const { productId, name, price, image, color, size, quantity = 1 } = req.body;

        // 查找或创建购物车
        let cart = await CartModel.findOne({
            merchantCode: user.merchantCode,
            userId: user._id.toString()
        });

        if (!cart) {
            cart = new CartModel({
                merchantCode: user.merchantCode,
                userId: user._id.toString(),
                items: []
            });
        }

        // 检查商品是否已存在
        const existingItemIndex = cart.items.findIndex(item =>
            item.productId === productId &&
            item.color === color &&
            item.size === size
        );

        if (existingItemIndex !== -1) {
            // 如果商品已存在，更新数量
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // 如果商品不存在，添加新商品
            cart.items.push({
                productId,
                name,
                price,
                image,
                color,
                size,
                quantity
            });
        }

        cart.updatedAt = new Date();
        await cart.save();

        res.json({
            success: true,
            message: '添加商品成功',
            data: cart.items
        });
    } catch (error) {
        console.error('添加商品到购物车错误:', error);
        res.status(500).json({
            success: false,
            message: '添加商品失败'
        });
    }
});

// 更新购物车商品数量
router.put('/cart/update', async (req, res) => {
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
            return res.status(401).json({
                success: false,
                message: '用户不存在'
            });
        }

        const { productId, color, size, quantity } = req.body;

        const cart = await CartModel.findOne({
            merchantCode: user.merchantCode,
            userId: user._id.toString()
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: '购物车不存在'
            });
        }

        // 查找并更新商品数量
        const itemIndex = cart.items.findIndex(item =>
            item.productId === productId &&
            item.color === color &&
            item.size === size
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: '商品不存在'
            });
        }

        if (quantity <= 0) {
            // 如果数量为0或负数，删除商品
            cart.items.splice(itemIndex, 1);
        } else {
            // 更新数量
            cart.items[itemIndex].quantity = quantity;
        }

        cart.updatedAt = new Date();
        await cart.save();

        res.json({
            success: true,
            message: '更新购物车成功',
            data: cart.items
        });
    } catch (error) {
        console.error('更新购物车错误:', error);
        res.status(500).json({
            success: false,
            message: '更新购物车失败'
        });
    }
});

// 删除购物车商品
router.delete('/cart/remove', async (req, res) => {
    try {
        console.log('删除购物车商品请求开始');
        console.log('请求体:', req.body);

        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            console.log('未提供访问令牌');
            return res.status(401).json({
                success: false,
                message: '未提供访问令牌'
            });
        }

        const decoded = JWT.verify(token, 'access_secret');
        console.log('Token解码成功，用户ID:', decoded.userId);

        const user = await userModel.findById(decoded.userId);

        if (!user) {
            console.log('用户不存在');
            return res.status(401).json({
                success: false,
                message: '用户不存在'
            });
        }

        console.log('用户信息:', {
            id: user._id,
            username: user.username,
            merchantCode: user.merchantCode
        });

        const { productId, color, size } = req.body;
        console.log('要删除的商品信息:', { productId, color, size });

        const cart = await CartModel.findOne({
            merchantCode: user.merchantCode,
            userId: user._id.toString()
        });

        console.log('找到的购物车:', cart ? '存在' : '不存在');

        if (!cart) {
            console.log('购物车不存在');
            return res.status(404).json({
                success: false,
                message: '购物车不存在'
            });
        }

        console.log('购物车中的商品数量:', cart.items.length);
        console.log('购物车商品列表:', cart.items.map(item => ({
            productId: item.productId,
            color: item.color,
            size: item.size
        })));

        // 删除指定商品
        const originalLength = cart.items.length;
        cart.items = cart.items.filter(item =>
            !(item.productId === productId &&
                item.color === color &&
                item.size === size)
        );

        console.log('过滤后的商品数量:', cart.items.length);
        console.log('删除的商品数量:', originalLength - cart.items.length);

        cart.updatedAt = new Date();
        await cart.save();
        console.log('购物车保存成功');

        res.json({
            success: true,
            message: '删除商品成功',
            data: cart.items
        });
    } catch (error) {
        console.error('删除购物车商品错误:', error);
        res.status(500).json({
            success: false,
            message: '删除商品失败'
        });
    }
});

// 清空购物车
router.delete('/cart/clear', async (req, res) => {
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
            return res.status(401).json({
                success: false,
                message: '用户不存在'
            });
        }

        const cart = await CartModel.findOne({
            merchantCode: user.merchantCode,
            userId: user._id.toString()
        });

        if (cart) {
            cart.items = [];
            cart.updatedAt = new Date();
            await cart.save();
        }

        res.json({
            success: true,
            message: '清空购物车成功',
            data: []
        });
    } catch (error) {
        console.error('清空购物车错误:', error);
        res.status(500).json({
            success: false,
            message: '清空购物车失败'
        });
    }
});

// 添加商品接口
router.post('/add-product', verifyAccessToken, async (req, res) => {
  try {
    const { name, price, category, description, image, color, size, stock, status } = req.body;
    
    // 从认证中间件获取用户信息
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    // 验证必填字段
    if (!name || !price || !category || !image || !color || !size || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段'
      });
    }

    // 创建新商品
    const newProduct = new shopModel({
      name,
      price: parseFloat(price),
      category,
      description: description || '',
      image,
      color: Array.isArray(color) ? color : [color],
      size: Array.isArray(size) ? size : [size],
      stock: parseInt(stock),
      status: status || 'pending',
      merchantCode: user.merchantCode || 'default',
      createTime: new Date(),
      updateTime: new Date()
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: '商品添加成功',
      data: {
        productId: savedProduct._id,
        message: '商品已提交审核'
      }
    });
  } catch (error) {
    console.error('添加商品失败:', error);
    res.status(500).json({
      success: false,
      message: '添加商品失败',
      error: error.message
    });
  }
});

module.exports = router;