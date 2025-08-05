<template>
  <MainLayout sidebar-title="统计" :nav-items="navItems" />
</template>

<script setup lang="ts">
  import MainLayout from './Divide/MainLayout.vue';

  const navItems = [
    { text: '交易统计', path: 'StatisticsList' },
    { text: '商品统计', path: 'StatisticsGoods' },
  ];
</script>

<style scoped lang="scss"></style>
