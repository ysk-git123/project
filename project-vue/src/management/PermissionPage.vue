<template>
  <MainLayout sidebar-title="权限" :nav-items="navItems" />
</template>

<script setup lang="ts">
  import MainLayout from './Divide/MainLayout.vue';

  const navItems = [{ text: '权限列表', path: 'PermissionList' }];
</script>

<style scoped lang="scss"></style>
