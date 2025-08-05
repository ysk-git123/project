<template>
  <MainLayout sidebar-title="运营" :nav-items="navItems" />
</template>

<script setup lang="ts">
  import MainLayout from './Divide/MainLayout.vue';

  const navItems = [{ text: '运营列表', path: 'OperationList' }];
</script>

<style scoped lang="scss"></style>
