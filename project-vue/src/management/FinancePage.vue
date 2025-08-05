<template>
  <MainLayout sidebar-title="财务" :nav-items="navItems" />
</template>

<script setup lang="ts">
  import MainLayout from './Divide/MainLayout.vue';

  const navItems = [{ text: '财务列表', path: 'FinanceList' }];
</script>

<style scoped lang="scss"></style>
