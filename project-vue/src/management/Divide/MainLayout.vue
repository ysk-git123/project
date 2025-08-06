<template>
  <el-container>
    <Sidebar :title="sidebarTitle" :nav-items="navItems" @item-click="handleItemClick" />
    <div class="main-container">
      <Header
        :current-title="currentTitle"
        :current-theme="currentTheme"
        @toggle-theme="toggleTheme"
      />
      <el-main class="main"><router-view></router-view></el-main>
    </div>
  </el-container>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, defineProps } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useStore } from 'vuex';
  import Sidebar from './AppSidebar.vue';
  import Header from './AppHeader.vue';

  const props = defineProps<{
    sidebarTitle: string;
    navItems: Array<{ text: string; path: string }>;
  }>();

  const store = useStore();
  const router = useRouter();
  const route = useRoute();
  const currentTheme = store.state.theme;
  const currentTitle = ref(props.navItems[0]?.text || '');

  const handleItemClick = (path: string, text: string) => {
    router.push(path);
    currentTitle.value = text;
  };

  const toggleTheme = () => {
    store.commit('toggleTheme');
  };

  onMounted(() => {
    const matchedItem = props.navItems.find((item) => item.path === route.path);
    if (matchedItem) {
      currentTitle.value = matchedItem.text;
    }
  });

  watch(
    () => route.path,
    (newPath) => {
      const matchedItem = props.navItems.find((item) => item.path === newPath);
      if (matchedItem) {
        currentTitle.value = matchedItem.text;
      }
    },
  );
</script>

<style scoped lang="scss">
  .main {
    background: rgb(255, 255, 255);
    border: 0.01rem solid rgb(235, 235, 235);
    padding: 1.5rem 1rem;
    height: 34.3rem;
    overflow-y: auto;
  }
  .main-container {
    width: 100%;
  }
</style>
