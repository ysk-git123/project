import TokenManager from './tokenManager';

// 登出函数
export const logout = () => {
  TokenManager.clearTokens();
  window.location.href = '/login';
};

// 检查用户是否已登录
export const isAuthenticated = (): boolean => {
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