// Token管理工具

/**
 * 获取访问令牌
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * 获取刷新令牌
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

/**
 * 设置访问令牌
 */
export const setAccessToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
  console.log('🔑 setAccessToken 被调用，token长度:', token.length);
  console.log('🔍 当前localStorage中的accessToken:', localStorage.getItem('accessToken'));
};

/**
 * 设置刷新令牌
 */
export const setRefreshToken = (token: string): void => {
  localStorage.setItem('refreshToken', token);
  console.log('🔑 setRefreshToken 被调用，token长度:', token.length);
  console.log('🔍 当前localStorage中的refreshToken:', localStorage.getItem('refreshToken'));
};

/**
 * 清除所有令牌
 */
export const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/**
 * 检查是否有有效的访问令牌
 */
export const hasValidToken = (): boolean => {
  const token = getAccessToken();
  return token !== null && token.length > 0;
};

/**
 * 检查是否有有效的刷新令牌
 */
export const hasValidRefreshToken = (): boolean => {
  const token = getRefreshToken();
  return token !== null && token.length > 0;
};

/**
 * 检查token是否即将过期（提前5分钟检测）
 */
export const isTokenExpiringSoon = (): boolean => {
  const token = getAccessToken();
  if (!token) return true;
  
  try {
    // 解析JWT token（不验证签名，只获取payload）
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = payload.exp;
    
    // 如果token在5分钟内过期，返回true
    return (expirationTime - currentTime) < 300; // 5分钟 = 300秒
  } catch (error) {
    console.error('解析token失败:', error);
    return true;
  }
};

/**
 * 启动token监控（调试用）
 */
export const startTokenMonitoring = (): void => {
  console.log('🔍 启动token监控...');
  
  // 每30秒检查一次token状态
  setInterval(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    console.log('🔍 Token状态检查:', {
      accessToken: accessToken ? `存在(${accessToken.length}字符)` : '不存在',
      refreshToken: refreshToken ? `存在(${refreshToken.length}字符)` : '不存在',
      timestamp: new Date().toLocaleTimeString()
    });
    
    // 如果token突然消失，记录警告
    if (!accessToken && !refreshToken) {
      console.warn('⚠️ 警告：所有token都消失了！');
    }
  }, 30000); // 30秒检查一次
}; 