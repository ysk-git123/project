import axios from "axios";

// 创建 axios 实例
const httpClient = axios.create({
    baseURL: "http://localhost:3000",
    timeout: 6000,
    withCredentials: true
});

// 请求拦截器
httpClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
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
    error => {
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
