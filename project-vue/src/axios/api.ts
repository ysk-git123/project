import request from './index';

// 定义接口类型
export interface LoginData {
  username: string;
  password: string;
}

export interface RefreshTokenData {
  refreshToken: string;
}

export interface MerchantListItem {
  _id: string;
  title: string;
  price: number;
  flag: boolean;
  merchant: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  msg?: string;
}

// 登录接口
export const login = (data: LoginData): Promise<ApiResponse> => {
  return request({
    url: '/LZY/login',
    method: 'post',
    data,
  });
};

// 刷新令牌接口
export const refreshToken = (data: RefreshTokenData): Promise<ApiResponse> => {
  return request({
    url: '/LZY/refreshToken',
    method: 'post',
    data,
  });
};

// 获取商家上下文数据接口
export const getMerchantContext = (): Promise<ApiResponse> => {
  const store = require('../store/index').default;
  const merchantCode = store.state.userInfo?.merchantCode;
  console.log('商家代码:', merchantCode);
  return request({
    url: '/LZY/context',
    method: 'get',
    params: { merchantCode },
  });
};

// 获取商家商品列表接口
export const getMerchantList = (): Promise<ApiResponse<MerchantListItem[]>> => {
  const store = require('../store/index').default;
  const merchantCode = store.state.userInfo?.merchantCode;
  console.log('获取商品列表，商家代码:', merchantCode);
  return request({
    url: '/YSK/shop',
    method: 'get',
    params: { merchantCode },
  });
};
