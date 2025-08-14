import request from './index';

// 定义接口类型
export interface LoginData {
  username: string;
  password: string;
}



// 更新商品列表项的接口，根据后端实际字段更新
export interface MerchantListItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  color: string[];
  size: string[];
  description: string;
  category: string;
  createTime: string;
}

// 添加商家上下文数据类型
export interface MerchantContextItem {
  _id: string;
  sjMerchantCode: string;
  sell: string;
}

// 定义分页信息的接口
export interface Pagination {
  current: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// 定义商品列表API响应的数据部分接口
export interface ProductListResponseData {
  list: MerchantListItem[];
  pagination: Pagination;
}

// 定义查询参数接口
export interface ProductListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// 登录响应数据类型
export interface LoginResponseData {
  username: string;
  role: string;
  userId: string;
  merchantCode: string;
  accessToken?: string;  // 可选的accessToken
  refreshToken?: string; // 可选的refreshToken
}

// 登录接口
export const login = (data: LoginData): Promise<ApiResponse<LoginResponseData>> => {
  return request({
    url: '/LZY/login',
    method: 'post',
    data,
  });
};



// 获取商家上下文数据接口
export const getMerchantContext = (): Promise<ApiResponse<MerchantContextItem[]>> => {
  const store = require('../store/index').default;
  const merchantCode = store.state.userInfo?.merchantCode;

  // 这个接口需要token验证，通过axios拦截器自动添加
  return request({
    url: '/LZY/context',
    method: 'get',
    params: { merchantCode },
  });
};

// 获取商家商品列表接口
export const getMerchantList = (params?: ProductListParams): Promise<ApiResponse<ProductListResponseData>> => {
  const store = require('../store/index').default;
  const merchantCode = store.state.userInfo?.merchantCode;
  
  if (!merchantCode) {
    return Promise.reject(new Error('商家代码未找到，请先登录'));
  }
  

  return request({
    url: '/YSK/shop',
    method: 'get',
    params: { ...params, merchantCode },
  });
};

// 获取商品分类接口（需要token验证）
export const getCategories = (): Promise<ApiResponse<string[]>> => {
  return request({
    url: '/YSK/shop/categories',
    method: 'get',
  });
};



// 审核商品相关接口类型定义
export interface AuditProductItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  merchantCode: string;
  createTime: string;
}

export interface AuditProductParams {
  page?: number;
  pageSize?: number;
  status?: string;
  category?: string;
  search?: string;
}

// 获取审核商品列表接口
export const getAuditProductList = (params?: AuditProductParams): Promise<ApiResponse<{
  list: AuditProductItem[];
  pagination: Pagination;
}>> => {
  return request({
    url: '/YSK/audit-products',
    method: 'get',
    params,
  });
};

// 审核商品接口
export const auditProduct = (productId: string, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return request({
    url: `/YSK/audit-products/${productId}`,
    method: 'put',
    data: { action, reason },
  });
};

// 重新提交商品接口
export const resubmitProduct = (productId: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return request({
    url: `/YSK/resubmit-products/${productId}`,
    method: 'put',
  });
};

// 添加商品接口类型定义
export interface AddProductData {
  name: string;
  price: number;
  category: string;
  description?: string;
  image: string;
  color: string[];
  size: string[];
  stock: number;
  merchantCode: string;
  status?: string;
  createTime?: string;
}

// 添加商品接口
export const addProduct = (data: AddProductData): Promise<ApiResponse<{ productId: string; message: string }>> => {
  return request({
    url: '/YSK/add-product',
    method: 'post',
    data,
  });
};


