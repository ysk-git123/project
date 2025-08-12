// Token 管理工具
class TokenManager {
  // 获取 Access Token
  static getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // 获取 Refresh Token
  static getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  // 设置 Token
  static setTokens(accessToken: string, refreshToken: string): void {
    if (!accessToken || !refreshToken) {
      console.warn('Token 为空:', { accessToken, refreshToken });
    }
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  // 清除 Token
  static clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // 检查 Token 是否过期
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // 提前5分钟认为Token过期，给刷新留出时间
      const advanceRefreshTime = 5 * 60 * 1000; // 5分钟
      return payload.exp * 1000 < (Date.now() + advanceRefreshTime);
    } catch {
      return true;
    }
  }

  // 刷新 Token
  static async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await fetch('http://localhost:3000/YSK/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        return data.data.accessToken;
      }

      return null;
    } catch (error) {
      console.error('刷新 Token 失败:', error);
      return null;
    }
  }
}

// 自动刷新Token的定时器
let refreshTimer: number | null = null;

// 启动自动刷新Token
export const startAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  // 每10分钟检查一次Token状态
  const autoRefreshInterval = 10 * 60 * 1000; // 10分钟
  refreshTimer = setInterval(async () => {
    const accessToken = TokenManager.getAccessToken();
    if (accessToken && TokenManager.isTokenExpired(accessToken)) {
      await TokenManager.refreshAccessToken();
    }
  }, autoRefreshInterval);
};

// 停止自动刷新
export const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

export default TokenManager; 