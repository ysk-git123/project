import request from './index';
// 提取 store 到顶部
const store = require('../store/index').default;

// 创建获取 merchantCode 的函数
const getMerchantCode = () => {
  return store.state.userInfo?.merchantCode;
};

// 获取权限列表接口
export const getMerchantRole = (params?: { username?: string; Authoritys?: string }) => {
  const merchantCode = getMerchantCode();
  console.log(merchantCode);
  return request({
    url: '/LZY/roleList',
    method: 'get',
    params: {
      merchantCode,
      ...params,
    },
  });
};

// 添加权限接口
export const getMerchantAdd = () => {
  const merchantCode = getMerchantCode();
  console.log('添加权限, merchantCode:', merchantCode);
  return request({
    url: '/LZY/roleAdd',
    method: 'post',
    params: {
      merchantCode,
    },
  });
};

// 删除权限接口
export const deleteMerchantRole = (id: string) => {
  const merchantCode = getMerchantCode();
  console.log(merchantCode);
  return request({
    url: `/LZY/roleDelete`,
    method: 'post',
    params: {
      id,
      merchantCode,
    },
  });
};

// LoginApp接口
export const getLoginApp = (data: { user: string; pass: string }) => {
  const merchantCode = getMerchantCode();
  console.log('添加权限, merchantCode:', merchantCode);
  console.log(data);
  return request({
    url: `/LZY/addlogin`,
    method: 'post',
    data,
  });
};

// 获取LoginApp的_id接口
export const getLoginAppId = () => {
  return request({
    url: `/LZY/getLoginApp`,
    method: 'get',
  });
};
export const getLoginAddRole = (data: {
  userAM: string;
  username: string;
  Authoritys: string;
  flag: boolean;
}) => {
  const merchantCode = getMerchantCode();
  console.log('添加权限, merchantCode:', merchantCode, data);
  return request({
    url: `/LZY/getAddRole`,
    method: 'post',
    data: {
      ...data,
      merchantCode,
    },
  });
};

// 一下接口为测试接口不属于lzyapi
// 登录接口
export const login = (data: { username: string; password: string }) => {
  console.log(data);
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
