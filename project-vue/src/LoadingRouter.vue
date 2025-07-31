<template>
  <div class="loading-overlay">
    <div class="loading-spinner">
      <span>Loading...</span>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .loading-spinner {
    font-size: 20px;
    color: #333;
    animation: spin 1s linear infinite;
  }
</style>
