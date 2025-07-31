import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

// 登录界面
import Login from '../pages/LoginPages.vue';
import Register from '../pages/RegisterPages.vue';
import Forget from '../pages/ForgetMm.vue';
// 目录界面
import Framework from '../management/FrameWork.vue';
import HomePage from '../management/HomePage.vue';
import ProductPage from '../management/ProductPage.vue';
import OrderPage from '../management/OrderPage.vue';
import UserPage from '../management/UserPage.vue';
import PromotionPage from '../management/PromotionPage.vue';
import OperationPage from '../management/OperationPage.vue';
import StatisticsPage from '../management/StatisticsPage.vue';
import FinancePage from '../management/FinancePage.vue';
import PermissionPage from '../management/PermissionPage.vue';
// 左侧导航栏
import AccoutSettingsPage from '../contents/AccoutSettingsPage.vue';
import LoginLogPage from '../contents/LoginLogPage.vue';
import SystemHomePage from '../contents/SystemHomePage.vue';
import SystemInfoPage from '../contents/SystemInfoPage.vue';

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
          { path: 'AccoutSettingsPage', name: 'AccoutSettingsPage', component: AccoutSettingsPage },
          { path: 'LoginLogPage', name: 'LoginLogPage', component: LoginLogPage },
          { path: 'SystemHomePage', name: 'SystemHomePage', component: SystemHomePage },
          { path: 'SystemInfoPage', name: 'SystemInfoPage', component: SystemInfoPage },
        ],
      },
      { path: 'product', name: 'Product', component: ProductPage },
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
export default router;
