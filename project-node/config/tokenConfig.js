// Token配置文件 - 统一管理所有Token相关配置
module.exports = {
    // Token过期时间配置
    expiresIn: {
        accessToken: '15m',    // 访问令牌过期时间：15分钟
        refreshToken: '7d'     // 刷新令牌过期时间：7天
    },
    
    // Token密钥配置
    secrets: {
        accessToken: 'access_secret',      // 访问令牌密钥
        refreshToken: 'refresh_secret'     // 刷新令牌密钥
    },
    
    // 刷新策略配置
    refresh: {
        // 提前多少时间开始刷新Token（毫秒）
        advanceRefreshTime: 5 * 60 * 1000,  // 5分钟
        
        // 自动刷新检查间隔（毫秒）
        autoRefreshInterval: 10 * 60 * 1000, // 10分钟
        
        // 最大重试次数
        maxRetryCount: 3
    },
    
    // 安全配置
    security: {
        // 是否启用Token轮换
        enableTokenRotation: true,
        
        // 是否在刷新时生成新的refreshToken
        generateNewRefreshToken: false
    }
}; 