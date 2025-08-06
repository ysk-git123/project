// 认证配置文件
module.exports = {
    // 密钥配置
    secrets: {
        accessToken: 'your_access_token_secret', // 访问令牌密钥
        refreshToken: 'your_refresh_token_secret' // 刷新令牌密钥
    },
    // 令牌过期时间配置
    expiresIn: {
        accessToken: '7d', // 访问令牌过期时间(15分钟)
        refreshToken: '7d' // 刷新令牌过期时间(7天)
    }
}