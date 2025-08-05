import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
// import router from '../router/index';
import rolePermissions from '../permission';
import { ElMessage } from 'element-plus';

/**
 * 创建文件并配置路由和权限
 * @param fileName 文件名
 * @param moduleName 模块名称(如product, order等)
 * @param fileContent 文件内容
 * @param routeText 路由显示文本
 * @returns 操作结果
 */
export function useCreateFileWithRoute() {
  const store = useStore();
  const router = useRouter();

  const createFileAndConfigureRoute = async (
    fileName: string,
    moduleName: string,
    fileContent: string,
    routeText: string,
  ) => {
    try {
      // 1. 定义新文件的路径
      const filePath = `d:\\Z小组项目开发\\project\\project-vue\\src\\contents\\${moduleName}\\${fileName}`;

      // 2. 创建文件 (浏览器环境下模拟，实际项目需后端支持)
      console.log(`创建文件: ${filePath}`);
      console.log(`文件内容: ${fileContent}`);

      // 3. 动态导入新组件并添加路由
      const newRoutePath = `/framework/${moduleName}/${fileName.replace('.vue', '')}`;
      const newRouteName = fileName.replace('.vue', '');

      // 动态导入组件
      const component = await import(`../contents/${moduleName}/${fileName}`);

      // 添加路由
      router.addRoute(moduleName.charAt(0).toUpperCase() + moduleName.slice(1), {
        path: newRouteName,
        name: newRouteName,
        component: component.default,
      });

      // 4. 更新权限配置
      Object.keys(rolePermissions).forEach((role) => {
        const permissions = rolePermissions[role as keyof typeof rolePermissions];
        const exists = permissions.some((item) => item.path === newRoutePath);
        if (!exists) {
          permissions.push({
            text: routeText,
            path: newRoutePath,
          });
        }
      });

      // 5. 更新状态并导航到新页面
      store.commit('setCurrentContent', routeText);
      await router.push(newRoutePath);

      ElMessage.success('文件创建成功并已配置路由和权限');
      return {
        success: true,
        path: newRoutePath,
      };
    } catch (error) {
      console.error('创建文件失败:', error);
      ElMessage.error('创建文件失败，请重试');
      return {
        success: false,
        error,
      };
    }
  };

  return {
    createFileAndConfigureRoute,
  };
}
