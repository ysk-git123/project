import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import store from '../store/index';
import rolePermissions from '../permission';

/**
 * 路由守卫函数
 * @param to - 目标路由
 * @param from - 来源路由
 * @param next - 继续导航的函数
 */
export function beforeEachGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  // 定义不需要登录的白名单路由
  const whiteList = ['/', '/register', '/forget'];

  // 检查是否在白名单中
  if (whiteList.includes(to.path)) {
    console.log('在白名单中，直接放行:', to.path);
    next();
    return;
  }

  // 检查是否已登录
  const isLoggedIn = store.state.isLoggedIn || localStorage.getItem('token');
  const userInfo = store.state.userInfo;

  console.log('登录状态:', isLoggedIn);
  console.log('用户信息:', userInfo);
  console.log('当前路径:', to.path);

  if (isLoggedIn) {
    // 如果是管理员角色，直接放行
    // if (
    //   userInfo &&
    //   typeof userInfo === 'object' &&
    //   'role' in userInfo &&
    //   (userInfo as { role: string }).role === 'admin'
    // ) {
    //   console.log('管理员角色，直接放行');
    //   next();
    //   return;
    // }

    // 对于非管理员角色，检查路由权限
    if (userInfo && typeof userInfo === 'object' && 'role' in userInfo) {
      const role = (userInfo as { role: string }).role;
      console.log('用户角色:', role);
      // 确保角色存在于权限配置中
      if (role in rolePermissions) {
        const allowedPaths = rolePermissions[role as keyof typeof rolePermissions].map(
          (item: { path: string }) => item.path,
        );
        console.log('允许的路径:', allowedPaths);

        // 检查当前路由是否在允许的路径中
        const isPathAllowed =
          allowedPaths.includes(to.path) ||
          allowedPaths.some((path) => to.path.startsWith(path + '/'));
        console.log('路径是否允许:', isPathAllowed);

        if (isPathAllowed) {
          next();
        } else {
          // 如果没有权限，重定向到第一个允许的路径
          if (allowedPaths.length > 0) {
            console.log('重定向到第一个允许的路径:', allowedPaths[0]);
            next(allowedPaths[0]);
          } else {
            // 如果没有允许的路径，重定向到登录页
            console.log('没有允许的路径，重定向到登录页');
            next('/');
          }
        }
      } else {
        // 如果角色不存在于权限配置中，重定向到登录页
        console.log('角色不存在于权限配置中，重定向到登录页');
        next('/');
      }
    } else {
      // 如果没有用户信息，重定向到登录页
      console.log('没有用户信息，重定向到登录页');
      next('/');
    }
  } else {
    console.log('未登录，重定向到登录页');
    next('/');
  }
}
