<template>
  <MainLayout sidebar-title="统计" :nav-items="navItems" />
</template>

<script setup lang="ts">
  import MainLayout from './Divide/MainLayout.vue';

  const navItems = [{ text: '统计列表', path: 'StatisticsList' }];
</script>

<style scoped lang="scss"></style>
