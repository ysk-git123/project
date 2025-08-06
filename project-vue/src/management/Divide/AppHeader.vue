<template>
  <el-header class="header">
    <div class="header-content">
      <el-header class="header-title">{{ props.currentTitle }}</el-header>
      <button class="theme-toggle" @click="toggleTheme">
        {{ props.currentTheme === 'light' ? '切换深色模式' : '切换浅色模式' }}
      </button>
    </div>
  </el-header>
</template>

<script setup lang="ts">
  import { defineProps, defineEmits } from 'vue';

  const props = defineProps<{
    currentTitle: string;
    currentTheme: string;
  }>();

  const emit = defineEmits<{
    (e: 'toggle-theme'): void;
  }>();

  const toggleTheme = () => {
    emit('toggle-theme');
  };
</script>

<style scoped lang="scss">
  .header {
    border: 0.01rem solid rgb(217, 217, 217);
    background: rgb(244, 244, 244);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 1rem;
  }

  .header-title {
    font-size: 1.2rem;
    font-weight: bold;
  }

  .theme-toggle {
    padding: 0.5rem 1rem;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
