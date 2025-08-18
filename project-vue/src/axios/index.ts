import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import { getAccessToken } from '../utils/tokenManager';

// 添加获取CSRF Token的函数
const getCSRFToken = () => {
  // 从cookie中获取CSRF token (根据服务器设置的cookie名称调整)
  const cookieValue = document.cookie
    .split('; ')    
    .find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
  return cookieValue ? decodeURIComponent(cookieValue) : null;
};

const service: AxiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
  withCredentials: true, // 全局设置允许携带cookie
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从token管理工具获取token
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // 添加CSRF Token到请求头
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }

    // 添加额外的请求头
    config.headers['X-Requested-With'] = 'XMLHttpRequest';

    console.log('📤 请求发送:', config.url, '方法:', config.method);
    console.log('📝 请求头:', config.headers);

    return config;
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error);
    ElMessage.error('请求配置失败: ' + error.message);
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    console.log('📥 响应接收:', response.config.url, '状态:', response.status);
    console.log('📝 响应数据:', res);
    return res;
  },
  (error) => {
    console.error('❌ 响应错误:', error.config?.url, '状态:', error.response?.status);
    console.error('❌ 错误详情:', error);
    
    // 增强错误信息
    let errorMessage = '请求失败';
    if (error.response) {
      errorMessage = `请求失败: ${error.response.status} ${error.response.statusText}`;
      if (error.response.data && error.response.data.message) {
        errorMessage += ` - ${error.response.data.message}`;
      }
    } else if (error.request) {
      errorMessage = '请求失败: 未收到响应';
    } else {
      errorMessage = `请求失败: ${error.message}`;
    }
    
    ElMessage.error(errorMessage);
    return Promise.reject(error);
  },
);

export default service;
