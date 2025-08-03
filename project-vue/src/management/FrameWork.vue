<template>
  <div>
    <div class="admin">
      <div>商城管理后台</div>
      <div class="nav">
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.path" class="nav-item">
            <router-link :to="item.path" class="nav-link" @click="updateContent(item.text)">
              {{ item.text }}
            </router-link>
          </li>
        </ul>
      </div>
      <div class="user">
        <div>admin(用户名)</div>
        <div>
          <el-icon><Bell /></el-icon>
        </div>
        <div>
          <el-icon @click="HandSwitch"><SwitchButton /></el-icon>
        </div>
      </div>
    </div>
    <div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, watch, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useStore } from 'vuex';
  import rolePermissions from '../permission';
  const store = useStore();
  const router = useRouter();
  const navItems = computed(() => {
    const userInfo = store.state.userInfo;
    if (!userInfo || !userInfo.role) return [];
    return rolePermissions[userInfo.role as keyof typeof rolePermissions] || rolePermissions.admin;
  });
  const pathMap: Record<string, string> = Object.fromEntries(
    navItems.value.map((item: { path: string; text: string }) => [item.path, item.text]),
  );
  const HandSwitch = () => {
    router.push('/');
  };
  const updateContent = (content: string) => {
    store.commit('setCurrentContent', content);
  };
  onMounted(() => {
    const currentPath = router.currentRoute.value.path;
    if (currentPath === '/framework/home/' || currentPath === '/framework') {
      store.commit('setCurrentContent', '首页');
    }
  });
  watch(
    () => router.currentRoute.value.path,
    (newPath) => {
      const matchedContent = pathMap[newPath];
      if (matchedContent) {
        store.commit('setCurrentContent', matchedContent);
      }
    },
  );
</script>

<style scoped lang="scss">
  .admin {
    width: 99%;
    height: 3rem;
    background: rgb(91, 91, 91);
    border: 0.01rem solid rgb(184, 184, 184);
    display: flex;
    justify-content: space-between;
    line-height: 3rem;
    color: white;
    padding: 0rem 0.5rem;
  }
  .nav {
    // width: 40rem;
    height: 3rem; /* 添加明确高度 */
    display: flex; /* 使用flex布局 */
    align-items: center; /* 垂直居中 */
  }

  .nav-list {
    display: flex;
    justify-content: space-between;
    list-style: none;
    align-items: center; /* 列表项垂直居中 */
    width: 100%; /* 占满父容器宽度 */
    padding: 0; /* 清除默认内边距 */
    margin: 0; /* 清除默认外边距 */
  }

  .nav-item {
    /* 可添加垂直居中相关样式 */
    line-height: normal; /* 确保不与flex居中冲突 */
    margin-left: 2rem;
  }
  .nav-link {
    color: inherit; // 继承父元素颜色
    text-decoration: none; // 移除下划线
    display: inline-block; // 确保padding生效
    padding: 0.5rem 0; // 保持点击区域
  }
  .nav-link.router-link-exact-active {
    color: rgb(103, 204, 255); // 激活状态颜色
    font-weight: bold; // 激活状态加粗
  }
  .nav-item:hover {
    color: rgb(103, 204, 255);
  }
  .user {
    width: 12rem;
    display: flex;
    justify-content: space-between;
    line-height: 3rem;
  }
</style>
