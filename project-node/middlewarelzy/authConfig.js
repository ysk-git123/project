// 认证配置文件 - 使用统一配置
const tokenConfig = require('../config/tokenConfig');

module.exports = {
    // 密钥配置
    secrets: {
        accessToken: tokenConfig.secrets.accessToken,
        refreshToken: tokenConfig.secrets.refreshToken
    },
    // 令牌过期时间配置
    expiresIn: {
        accessToken: tokenConfig.expiresIn.accessToken,
        refreshToken: tokenConfig.expiresIn.refreshToken
    }
}