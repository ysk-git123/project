<template>
  <div class="home-page">
    <h1>首页</h1>
    <div class="content-container"></div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
  .home-page {
    height: 100%;
    padding: 1.5rem;
  }

  .content-container {
    margin-top: 1rem;
    background-color: #fff;
    border-radius: 0.25rem;
    padding: 1.5rem;
    min-height: calc(100% - 3rem);
  }
</style>
