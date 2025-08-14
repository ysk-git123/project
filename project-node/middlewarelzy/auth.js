const generateTokens = require("./generateTokens");
const verifyAccessToken = require("./verifyAccessToken");
const refreshTokenController = require("./refreshTokenController");
const authConfig = require("./authConfig");

// 统一的token验证中间件
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供访问令牌'
      });
    }

    // 使用统一的密钥验证token
    const decoded = require('jsonwebtoken').verify(token, authConfig.secrets.accessToken);
    
    // 将用户信息添加到请求对象中
    req.user = decoded;
    req.userId = decoded.userId;
    req.merchantCode = decoded.merchantCode;
    
    next();
  } catch (error) {
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
    
    return res.status(500).json({
      success: false,
      message: '服务器错误',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  refreshTokenController,
  authMiddleware
};
