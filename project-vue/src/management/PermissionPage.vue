<template>
  <MainLayout sidebar-title="权限" :nav-items="navItems" />
</template>

<script setup lang="ts">
  import MainLayout from './Divide/MainLayout.vue';

  const navItems = [
    { text: '角色管理', path: 'PermissionUser' },
    { text: '成员管理', path: 'PermissionMember' },
    // { text: '操作日志', path: 'PermissionList' },
  ];
</script>

<style scoped lang="scss"></style>
