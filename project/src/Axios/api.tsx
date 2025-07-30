import axios from "axios";
import TokenManager from "../utils/tokenManager";

// 创建 axios 实例
const httpClient = axios.create({
    baseURL: "http://localhost:3000",
    timeout: 6000,
    withCredentials: false  
});

// 用于存储刷新 Token 的 Promise
let refreshPromise: Promise<string | null> | null = null;

// 请求拦截器
httpClient.interceptors.request.use(
    async config => {
        const accessToken = TokenManager.getAccessToken();
        
        if (accessToken) {
            // 检查 Token 是否即将过期（提前5分钟刷新）
            if (TokenManager.isTokenExpired(accessToken)) {
                // 如果正在刷新，等待刷新完成
                if (refreshPromise) {
                    const newToken = await refreshPromise;
                    if (newToken) {
                        config.headers['Authorization'] = `Bearer ${newToken}`;
                    }
                } else {
                    // 开始刷新 Token
                    refreshPromise = TokenManager.refreshAccessToken();
                    const newToken = await refreshPromise;
                    refreshPromise = null;
                    
                    if (newToken) {
                        config.headers['Authorization'] = `Bearer ${newToken}`;
                    } else {
                        // 刷新失败，清除 Token 并跳转到登录页
                        TokenManager.clearTokens();
                        window.location.href = '/login';
                        return Promise.reject(new Error('Token 刷新失败'));
                    }
                }
            } else {
                config.headers['Authorization'] = `Bearer ${accessToken}`;
            }
        }
        
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
httpClient.interceptors.response.use(
    response => {
        return response;
    },
    async error => {
        const originalRequest = error.config;
        
        // 如果是 401 错误且不是刷新 Token 的请求
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // 尝试刷新 Token
                const newToken = await TokenManager.refreshAccessToken();
                
                if (newToken) {
                    // 使用新 Token 重试原请求
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return httpClient(originalRequest);
                } else {
                    // 刷新失败，跳转到登录页
                    TokenManager.clearTokens();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                // 刷新失败，跳转到登录页
                TokenManager.clearTokens();
                window.location.href = '/login';
                return Promise.reject(error);
    }
        }
        
        return Promise.reject(error);
    }
);

// 封装 GET 请求
export const GET = (url: string, config = {}) => {
    return httpClient.get(url, config);
};

// 封装 POST 请求
export const POST = (url: string, data = {}, config = {}) => {
    return httpClient.post(url, data, config);
};

// 封装 PUT 请求
export const PUT = (url: string, data = {}, config = {}) => {
    return httpClient.put(url, data, config);
};

// 封装 DELETE 请求
export const DELETE = (url: string, config = {}) => {
    return httpClient.delete(url, config);
};

export default httpClient;
