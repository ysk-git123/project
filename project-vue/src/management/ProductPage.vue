<template>
  <MainLayout sidebar-title="商品" :nav-items="navItems" />
</template>

<script setup lang="ts">
  import MainLayout from './Divide/MainLayout.vue';

  const navItems = [
    { text: '商品列表', path: 'ProductListPage' },
    { text: '商品审核', path: 'ProductAuditPage' },
    { text: '添加商品', path: 'AddProductPage' },
    { text: '商品分类', path: 'ProductCategoryPage' },
    { text: '商品评价', path: 'ProductReviewPage' },
    { text: '商品设置', path: 'ProductSettingsPage' },
    { text: '库存设置', path: 'InventorySettingsPage' },
    { text: '商品回收站', path: 'ProductRecycleBinPage' },
  ];
</script>

<style scoped lang="scss"></style>
