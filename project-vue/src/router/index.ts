import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { beforeEachGuard } from './beforeEachGuard'; // 导入路由守卫
// import store from '../store/index';
// import rolePermissions from '../permission';

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
import AccountSettPage from '../contents/home/AccountSettPage.vue'; //账号设置
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
import OrderListPage from '../contents/order/OrderListPage.vue'; // 订单列表
import OrderSettingsPage from '../contents/order/OrderSettingsPage.vue'; // 订单设置
import RefundApplicationPage from '../contents/order/RefundApplicationPage.vue'; // 退款申请
import ReturnApplicationPage from '../contents/order/ReturnApplicationPage.vue'; // 退货申请
import ReturnReasonSettingsPage from '../contents/order/ReturnReasonSettingsPage.vue'; // 退换原因设置
// 左侧导航栏user
import UserList from '../contents/user/UserList.vue';
// 左侧导航栏promotion
import PromotionList from '../contents/promotion/PromotionList.vue';
// 左侧导航栏operation
import OperationList from '../contents/operation/OperationList.vue';
// 左侧导航栏statistics
import StatisticsList from '../contents/statistics/StatisticsList.vue';
import StatisticsGoods from '../contents/statistics/StatisticsGoods.vue';
// 左侧导航栏finance
import FinanceList from '../contents/finance/FinanceList.vue';
// 左侧导航栏permission
import PermissionList from '../contents/permission/PermissionList.vue';
import PermissionMember from '../contents/permission/PermissionMember.vue';
import PermissionUser from '../contents/permission/PermissionUser.vue';

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
        redirect: '/framework/home/SystemHomePage', // 添加默认重定向路由
        children: [
          { path: 'AccountSettPage', name: 'AccountSettPage', component: AccountSettPage },
          { path: 'LoginLogPage', name: 'LoginLogPage', component: LoginLogPage },
          { path: 'SystemHomePage', name: 'SystemHomePage', component: SystemHomePage },
          { path: 'SystemInfoPage', name: 'SystemInfoPage', component: SystemInfoPage },
        ],
      },
      {
        path: 'product',
        name: 'Product',
        component: ProductPage,
        redirect: '/framework/product/ProductListPage', // 添加默认重定向路由
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
      {
        path: 'order',
        name: 'Order',
        component: OrderPage,
        redirect: '/framework/order/OrderListPage', // 添加默认重定向路由
        children: [
          { path: 'OrderListPage', name: 'OrderListPage', component: OrderListPage },
          { path: 'OrderSettingsPage', name: 'OrderSettingsPage', component: OrderSettingsPage },
          {
            path: 'RefundApplicationPage',
            name: 'RefundApplicationPage',
            component: RefundApplicationPage,
          },
          {
            path: 'ReturnApplicationPage',
            name: 'ReturnApplicationPage',
            component: ReturnApplicationPage,
          },
          {
            path: 'ReturnReasonSettingsPage',
            name: 'ReturnReasonSettingsPage',
            component: ReturnReasonSettingsPage,
          },
        ],
      },
      {
        path: 'user',
        name: 'User',
        component: UserPage,
        redirect: '/framework/user/UserList', // 添加默认重定向路由
        children: [{ path: 'UserList', name: 'UserList', component: UserList }],
      },
      {
        path: 'promotion',
        name: 'Promotion',
        component: PromotionPage,
        redirect: '/framework/promotion/PromotionList', // 添加默认重定向路由
        children: [{ path: 'PromotionList', name: 'PromotionList', component: PromotionList }],
      },
      {
        path: 'operation',
        name: 'Operation',
        component: OperationPage,
        redirect: '/framework/operation/OperationList', // 添加默认重定向路由
        children: [{ path: 'OperationList', name: 'OperationList', component: OperationList }],
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: StatisticsPage,
        redirect: '/framework/statistics/StatisticsList', // 添加默认重定向路由
        children: [
          { path: 'StatisticsList', name: 'StatisticsList', component: StatisticsList },
          { path: 'StatisticsGoods', name: 'StatisticsGoods', component: StatisticsGoods },
        ],
      },
      {
        path: 'finance',
        name: 'Finance',
        component: FinancePage,
        redirect: '/framework/finance/FinanceList', // 添加默认重定向路由
        children: [{ path: 'FinanceList', name: 'FinanceList', component: FinanceList }],
      },
      {
        path: 'permission',
        name: 'Permission',
        component: PermissionPage,
        redirect: '/framework/permission/PermissionUser', // 添加默认重定向路由
        children: [
          { path: 'PermissionList', name: 'PermissionList', component: PermissionList },
          { path: 'PermissionMember', name: 'PermissionMember', component: PermissionMember },
          { path: 'PermissionUser', name: 'PermissionUser', component: PermissionUser },
        ],
      },
    ],
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 添加路由守卫
router.beforeEach(beforeEachGuard);

export default router;
