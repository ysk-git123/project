import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import store from '../store/index';

// console.log(process.env.VUE_APP_API_BASE_URL || '/api');
const service: AxiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL
    ? process.env.VUE_APP_API_BASE_URL.replace('/api', '')
    : '/api', //基础URL
  //baseURL: 'http://localhost:3000', // 绝对路径
  timeout: 5000, // 超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});
// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.state.token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    ElMessage.error(error);
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    // 处理响应数据
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败');
      // 未授权处理
      if (res.code === 401) {
        store.commit('logout');
        window.location.href = '/login';
      }
      return Promise.reject(res);
    }
    return res;
  },
  (error) => {
    ElMessage.error(error);
    return Promise.reject(error);
  },
);

export default service;
