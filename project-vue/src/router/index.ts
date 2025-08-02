import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import store from '../store/index';

// 登录界面
import Login from '../pages/LoginPages.vue';
import Register from '../pages/RegisterPages.vue';
import Forget from '../pages/ForgetMm.vue';
// 目录界面
import Framework from '../management/FrameWork.vue';
import HomePage from '../management/HomePage.vue'; //首页
import ProductPage from '../management/ProductPage.vue'; //商品
import OrderPage from '../management/OrderPage.vue'; //订单
import UserPage from '../management/UserPage.vue'; //用户
import PromotionPage from '../management/PromotionPage.vue'; //促销
import OperationPage from '../management/OperationPage.vue'; //运营
import StatisticsPage from '../management/StatisticsPage.vue'; //统计
import FinancePage from '../management/FinancePage.vue'; // 财务
import PermissionPage from '../management/PermissionPage.vue'; //权限
// 左侧导航栏home
import AccoutSettPage from '../contents/home/AccountSettPage.vue'; //账号设置
import LoginLogPage from '../contents/home/LoginLogPage.vue'; // 登录日志
import SystemHomePage from '../contents/home/SystemHomePage.vue'; // 系统首页
import SystemInfoPage from '../contents/home/SystemInfoPage.vue'; // 系统信息
// 左侧导航栏product
import AddProductPage from '../contents/product/AddProductPage.vue'; // 添加商品
import InventorySettingsPage from '../contents/product/InventorySettingsPage.vue'; // 库存设置
import ProductAuditPage from '../contents/product/ProductAuditPage.vue'; // 商品审核
import ProductCategoryPage from '../contents/product/ProductCategoryPage.vue'; // 商品分类
import ProductListPage from '../contents/product/ProductListPage.vue'; // 商品列表
import ProductRecycleBinPage from '../contents/product/ProductRecycleBinPage.vue'; // 商品回收站
import ProductReviewPage from '../contents/product/ProductReviewPage.vue'; // 商品审核
import ProductSettingsPage from '../contents/product/ProductSettingsPage.vue'; // 商品设置
// 左侧导航栏order

// 左侧导航栏user

// 左侧导航栏promotion

// 左侧导航栏operation

// 左侧导航栏statistics

// 左侧导航栏finance

// 左侧导航栏permission

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/forget', name: 'Forget', component: Forget },
  {
    path: '/framework',
    name: 'framework',
    component: Framework,
    children: [
      {
        path: 'home',
        name: 'Home',
        component: HomePage,
        children: [
          { path: 'AccoutSettPage', name: 'AccoutSettPage', component: AccoutSettPage },
          { path: 'LoginLogPage', name: 'LoginLogPage', component: LoginLogPage },
          { path: 'SystemHomePage', name: 'SystemHomePage', component: SystemHomePage },
          { path: 'SystemInfoPage', name: 'SystemInfoPage', component: SystemInfoPage },
        ],
      },
      {
        path: 'product',
        name: 'Product',
        component: ProductPage,
        children: [
          { path: 'ProductListPage', name: 'ProductListPage', component: ProductListPage },
          { path: 'ProductAuditPage', name: 'ProductAuditPage', component: ProductAuditPage },
          { path: 'AddProductPage', name: 'AddProductPage', component: AddProductPage },
          {
            path: 'ProductCategoryPage',
            name: 'ProductCategoryPage',
            component: ProductCategoryPage,
          },
          { path: 'ProductReviewPage', name: 'ProductReviewPage', component: ProductReviewPage },
          {
            path: 'ProductSettingsPage',
            name: 'ProductSettingsPage',
            component: ProductSettingsPage,
          },
          {
            path: 'InventorySettingsPage',
            name: 'InventorySettingsPage',
            component: InventorySettingsPage,
          },
          {
            path: 'ProductRecycleBinPage',
            name: 'ProductRecycleBinPage',
            component: ProductRecycleBinPage,
          },
        ],
      },
      { path: 'order', name: 'Order', component: OrderPage },
      { path: 'user', name: 'User', component: UserPage },
      { path: 'promotion', name: 'Promotion', component: PromotionPage },
      { path: 'operation', name: 'Operation', component: OperationPage },
      { path: 'statistics', name: 'Statistics', component: StatisticsPage },
      { path: 'finance', name: 'Finance', component: FinancePage },
      { path: 'permission', name: 'Permission', component: PermissionPage },
    ],
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 添加路由守卫
router.beforeEach((to, from, next) => {
  // 定义不需要登录的白名单路由
  const whiteList = ['/', '/register', '/forget'];

  // 检查是否在白名单中
  if (whiteList.includes(to.path)) {
    next();
    return;
  }

  // 检查是否已登录 (假设store中有isLoggedIn状态)
  // 如果没有使用Vuex, 可以使用localStorage检查: localStorage.getItem('token')
  const isLoggedIn = store.state.isLoggedIn || localStorage.getItem('token');

  if (isLoggedIn) {
    next();
  } else {
    next('/');
  }
});
export default router;
