<template>
  <MainLayout sidebar-title="首页" :nav-items="navItems" />
</template>

<script setup lang="ts">
  import MainLayout from './Divide/MainLayout.vue';

  const navItems = [
    { text: '系统首页', path: 'SystemHomePage' },
    { text: '账户设置', path: 'AccountSettPage' },
    { text: '系统信息', path: 'SystemInfoPage' },
    { text: '登录日志', path: 'LoginLogPage' },
  ];
</script>

<style scoped lang="scss">
  /* 如有需要的全局样式可以在这里添加 */
</style>
