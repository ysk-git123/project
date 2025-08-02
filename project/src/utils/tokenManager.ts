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
      return payload.exp * 1000 < Date.now();
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

export default TokenManager; 