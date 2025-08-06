<template>
  <MainLayout sidebar-title="用户" :nav-items="navItems" />
</template>

<script setup lang="ts">
  import MainLayout from './Divide/MainLayout.vue';

  const navItems = [{ text: '用户列表', path: 'UserList' }];
</script>

<style scoped lang="scss"></style>
