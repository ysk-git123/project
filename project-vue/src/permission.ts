// 定义角色权限配置
const rolePermissions = {
  // 商家角色
  merchant: [
    { text: '首页', path: '/framework/home/SystemHomePage' },
    { text: '商品', path: '/framework/product/AddProductPage' },
    { text: '订单', path: '/framework/order' },
  ],
  // 管理员角色(默认全部权限)
  admin: [
    { text: '首页', path: '/framework/home/SystemHomePage' },
    { text: '商品', path: '/framework/product/AddProductPage' },
    { text: '订单', path: '/framework/order' },
    { text: '用户', path: '/framework/user' },
    { text: '促销', path: '/framework/promotion' },
    { text: '运营', path: '/framework/operation' },
    { text: '统计', path: '/framework/statistics' },
    { text: '财务', path: '/framework/finance' },
    { text: '权限', path: '/framework/permission' },
  ],
};

export default rolePermissions;
