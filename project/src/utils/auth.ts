import TokenManager from './tokenManager';

// 登出函数
export const logout = () => {
  TokenManager.clearTokens();
  window.location.href = '/login';
};

// 检查用户是否已登录
export const isAuthenticated = async (): Promise<boolean> => {
  const accessToken = TokenManager.getAccessToken();
  const user = localStorage.getItem('user');
  
  if (!accessToken || !user) {
    return false;
  }

  // 检查 token 是否过期
  if (TokenManager.isTokenExpired(accessToken)) {
    // 尝试刷新 token
    const newToken = await TokenManager.refreshAccessToken();
    if (newToken) {
      return true;
    } else {
      // 刷新失败，清除无效的 token
      TokenManager.clearTokens();
      return false;
    }
  }

  return true;
};

// 同步版本的登录检查（用于路由守卫）
export const isAuthenticatedSync = (): boolean => {
  const accessToken = TokenManager.getAccessToken();
  const user = localStorage.getItem('user');
  return !!(accessToken && user);
};

// 获取用户信息
export const getUser = (): any => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// 获取用户角色
export const getUserRole = (): string | null => {
  const user = getUser();
  return user?.role || null;
}; 