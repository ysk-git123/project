import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import store from '../store/index';
import { refreshToken } from './lzyapi'; // 导入刷新令牌函数

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

// 用于存储刷新token的Promise
let refreshTokenPromise: Promise<boolean> | null = null;

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = store.state.accessToken;
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
      // console.log('添加Authorization头:', config.headers.Authorization);
    } else {
      console.warn('未找到accessToken');
    }
    // 添加商家标识到请求头
    if (
      store.state.userInfo &&
      typeof store.state.userInfo === 'object' &&
      'merchantCode' in store.state.userInfo
    ) {
      config.headers = config.headers || {};
      config.headers['Merchant-Code'] = (
        store.state.userInfo as { merchantCode: string }
      ).merchantCode;
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
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败');
      return Promise.reject(res);
    }
    return res;
  },
  async (error) => {
    // 处理401错误
    if (error.response && error.response.status === 401) {
      // 如果没有refreshToken，直接跳转登录
      if (!store.state.refreshToken) {
        store.commit('logout');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      // 如果已有刷新token的请求正在进行，则等待其完成
      if (refreshTokenPromise) {
        return refreshTokenPromise.then((success) => {
          if (success) {
            // 刷新成功，重试原请求
            return service(error.config);
          } else {
            return Promise.reject(error);
          }
        });
      }
      // 创建刷新token的请求
      refreshTokenPromise = new Promise((resolve) => {
        // 将async逻辑移动到内部函数中，以避免阻塞其他请求
        const refreshTokenInner = async () => {
          try {
            const response = await refreshToken({
              refreshToken: store.state.refreshToken,
            });
            // 修复类型错误：访问response.data.code而不是response.code
            if (response.data.code === 200) {
              store.commit('updateTokens', {
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken, // 如果后端返回新的refreshToken
              });
              resolve(true);
            } else {
              store.commit('logout');
              resolve(false);
            }
          } catch (err) {
            console.error('刷新令牌失败:', err);
            store.commit('logout');
            resolve(false);
          }
        };
        refreshTokenInner();
      });
      try {
        const success = await refreshTokenPromise;
        refreshTokenPromise = null;
        if (success) {
          // 刷新成功，重试原请求
          return service(error.config);
        } else {
          return Promise.reject(error);
        }
      } catch (err) {
        refreshTokenPromise = null;
        return Promise.reject(err);
      }
    }
    ElMessage.error(error.message || '请求失败');
    return Promise.reject(error);
  },
);

export default service;
