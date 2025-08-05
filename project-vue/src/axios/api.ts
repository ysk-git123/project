import request from './index';
// 登录接口
export const login = (data: { username: string; password: string }) => {
  return request({
    url: '/LZY/login',
    method: 'post',
    data,
  });
};

// 刷新令牌接口
export const refreshToken = (data: { refreshToken: string }) => {
  return request({
    url: '/LZY/refreshToken',
    method: 'post',
    data,
  });
};

// 获取商家上下文数据接口
export const getMerchantContext = () => {
  const store = require('../store/index').default;
  const merchantCode = store.state.userInfo?.merchantCode;
  console.log(merchantCode);
  return request({
    url: '/LZY/context',
    method: 'get',
    params: { merchantCode },
  });
};

// 获取商家上下文数据接口
export const getMerchantList = () => {
  const store = require('../store/index').default;
  const merchantCode = store.state.userInfo?.merchantCode;
  console.log(merchantCode);
  return request({
    url: '/LZY/list',
    method: 'get',
    params: { merchantCode },
  });
};
