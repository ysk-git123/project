var express = require('express');
var router = express.Router();

var Login = require('../../database/Login')
var JWT = require('jsonwebtoken')

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        console.log(username, password);

        const user = await Login.findOne({ username })
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: '用户不存在' 
            })
        }
        
        // 验证密码
        if (user.password !== password) {
            return res.status(401).json({ 
                success: false,
                message: '密码错误' 
            })
        }
        
        const token = JWT.sign({ userId: user._id }, 'secret', { expiresIn: '1h' })
        res.json({ 
            success: true,
            message: '登录成功',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role
                },
                token
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

module.exports = router;