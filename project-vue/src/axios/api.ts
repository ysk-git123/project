import request from './index';
// 登录接口
export const login = (data: { username: string; password: string }) => {
  return request({
    url: '/LZY/login',
    method: 'post',
    data,
  });
};
