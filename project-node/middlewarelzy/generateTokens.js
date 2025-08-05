const jwt = require('jsonwebtoken');
const authConfig = require('./authConfig');

/**
 * 生成访问令牌和刷新令牌
 * @param {Object} user - 用户信息
 * @param {string} merchantCode - 商户代码
 * @returns {Object} 包含访问令牌和刷新令牌的对象
 */
function generateTokens(user, merchantCode) {
    // 生成访问令牌
    const accessToken = jwt.sign(
        {
            userId:user._id,
            username:user.username,
            merchantCode:merchantCode
        },
        authConfig.secrets.accessToken,
        { expiresIn: authConfig.expiresIn.accessToken }
    );
    // 生成刷新令牌
    const refreshToken = jwt.sign(
        {
            userId:user._id,
            merchantCode:merchantCode
        },
        authConfig.secrets.refreshToken,
        { expiresIn: authConfig.expiresIn.refreshToken }
    );
    return { accessToken, refreshToken };
}

module.exports = generateTokens;