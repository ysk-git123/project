<template>
  <MainLayout sidebar-title="促销" :nav-items="navItems" />
</template>

<script setup lang="ts">
  import MainLayout from './Divide/MainLayout.vue';

  const navItems = [{ text: '促销列表', path: 'PromotionList' }];
</script>

<style scoped lang="scss"></style>
