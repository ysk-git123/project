<template>
  <MainLayout sidebar-title="订单" :nav-items="navItems" />
</template>

<script setup lang="ts">
  import MainLayout from './Divide/MainLayout.vue';

  const navItems = [
    { text: '订单列表', path: 'OrderListPage' },
    { text: '订单设置', path: 'OrderSettingsPage' },
    { text: '退款申请', path: 'RefundApplicationPage' },
    { text: '退换货申请', path: 'ReturnApplicationPage' },
    { text: '退换原因设置', path: 'ReturnReasonSettingsPage' },
  ];
</script>

<style scoped lang="scss"></style>
