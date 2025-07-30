var express = require('express');
var router = express.Router();

var { userModel, roleModel, menuModel  } = require('../../database/Login')
var { shopModel } = require('../../database/shop')
var JWT = require('jsonwebtoken')

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        console.log('登录请求:', { username, password: '***' });

        const user = await userModel.findOne({ username, password }).populate('role_id',);
        console.log('完整用户数据:', user);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户不存在'
            })
        }

        // 获取完整的角色信息
        const roleInfo = user.role_id ? {
            id: user.role_id._id,
            name: user.role_id.rolename,
            description: user.role_id.description,
            status: user.role_id.status,
            permissions: user.role_id.permissions || []
        } : {
            id: null,
            name: '普通用户',
            description: '默认角色',
            status: 1,
            permissions: []
        };

        // 生成双 Token
        const accessToken = JWT.sign(
            {
                userId: user._id,
                username: user.username,
                roleId: roleInfo.id,
                roleName: roleInfo.name
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
                    role: roleInfo
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
        const user = await userModel.findById(decoded.userId).populate({
            path: 'role_id',
            select: 'rolename description status permissions'
        });

        if (!user || user.status === 0) {
            return res.status(401).json({
                success: false,
                message: '用户不存在或已被禁用'
            });
        }

        // 获取完整的角色信息
        const roleInfo = user.role_id ? {
            id: user.role_id._id,
            name: user.role_id.rolename,
            description: user.role_id.description,
            status: user.role_id.status,
            permissions: user.role_id.permissions || []
        } : {
            id: null,
            name: '普通用户',
            description: '默认角色',
            status: 1,
            permissions: []
        };

        // 生成新的访问令牌
        const newAccessToken = JWT.sign(
            {
                userId: user._id,
                username: user.username,
                roleId: roleInfo.id,
                roleName: roleInfo.name
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
        const data = await shopModel.find().sort({ _id: -1 });
        res.json({
            success: true,
            message: '获取商品成功',
            data
        });
    } catch (error) {
        console.error('获取商品错误:', error);
        res.status(500).json({
            success: false,
            message: '获取商品失败'
        });
    }
});

// 添加商品
router.post('/shop', async (req, res) => {
    try {
        const { name, img, price, color, size, description, category } = req.body;
        
        // 验证必填字段
        if (!name || !img || !price || !category) {
            return res.status(400).json({
                success: false,
                message: '商品名称、图片、价格和分类为必填项'
            });
        }
        
        const newShop = new shopModel({
            name,
            img,
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