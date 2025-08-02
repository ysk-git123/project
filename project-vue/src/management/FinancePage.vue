<template>
  <el-container>
    <el-aside class="aside">
      <div class="aside-title">财务</div>
      <div
        v-for="item in navItems"
        :key="item.path"
        class="nav-link"
        @click="handPagel(item.path, item.text)"
      >
        <router-link :to="item.path" class="router-link">
          {{ item.text }}
        </router-link>
      </div>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <el-header class="header">{{ currentTitle }}</el-header>
          <button class="theme-toggle" @click="toggleTheme">
            {{ currentTheme === 'light' ? '切换深色模式' : '切换浅色模式' }}
          </button>
        </div>
      </el-header>
      <el-main class="main"><router-view></router-view></el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useStore } from 'vuex';
  const store = useStore();
  const router = useRouter();
  const route = useRoute();
  const currentTheme = store.state.theme;
  const currentTitle = ref('系统首页');
  const navItems = [
    { text: '系统首页', path: '/framework/home/SystemHomePage' },
    { text: '账户设置', path: '/framework/home/AccoutSettPage' },
    { text: '系统信息', path: '/framework/home/SystemInfoPage' },
    { text: '登录日志', path: '/framework/home/LoginLogPage' },
  ];
  const handPagel = (path: string, text: string) => {
    router.push(path);
    currentTitle.value = text;
  };
  const toggleTheme = () => {
    store.commit('toggleTheme');
  };
  onMounted(() => {
    const matchedItem = navItems.find((item) => item.path === route.path);
    if (matchedItem) {
      currentTitle.value = matchedItem.text;
    }
  });
  watch(
    () => route.path,
    (newPath) => {
      const matchedItem = navItems.find((item) => item.path === newPath);
      if (matchedItem) {
        currentTitle.value = matchedItem.text;
      }
    },
  );
</script>

<style scoped lang="scss">
  .aside {
    width: 12.7rem;
    height: 39rem;
    background: rgb(244, 244, 244);
    border: 0.01rem solid rgb(218, 218, 218);
  }
  .header {
    border: 0.01rem solid rgb(217, 217, 217);
    background: rgb(244, 244, 244);
  }
  .aside-title {
    width: 100%;
    border-bottom: 0.01rem solid rgb(217, 217, 217);
    height: 3.65rem;
    text-align: center;
    line-height: 3.65rem;
    font-size: 1.2rem;
  }
  .header {
    border: 0.01rem solid rgb(217, 217, 217);
    background: rgb(244, 244, 244);
  }
  .main {
    background: rgb(255, 255, 255);
    border: 0.01rem solid rgb(235, 235, 235);
    padding: 1.5rem 1rem;
  }
  .nav-link {
    width: 100%;
    height: 3rem;
    text-align: center;
    line-height: 3rem;
    border-bottom: 0.01rem solid rgb(217, 217, 217);
  }
  .router-link {
    color: rgb(109, 109, 109);
    text-decoration: none;
  }
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 1rem;
  }
  .theme-toggle {
    padding: 0.5rem 1rem;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
