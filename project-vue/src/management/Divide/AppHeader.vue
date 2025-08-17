<template>
  <el-header class="header">
    <div class="header-content">
      <el-header class="header-title">{{ props.currentTitle }}</el-header>
      <button class="theme-toggle" @click="toggleTheme">
        {{ currentTheme === 'light' ? '切换深色模式' : '切换浅色模式' }}
      </button>
    </div>
  </el-header>
</template>

<script setup lang="ts">
  import { defineProps, ref, onMounted } from 'vue';
  const props = defineProps<{ currentTitle: string }>();
  const currentTheme = ref('light');

  // 初始化主题
  onMounted(() => {
    // 从localStorage读取保存的主题
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme.value = savedTheme;
    updateTheme();
    console.log('初始主题:', currentTheme.value); // 添加调试日志
  });

  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
    // 保存到localStorage
    localStorage.setItem('theme', currentTheme.value);
    updateTheme();
    console.log('切换后主题:', currentTheme.value); // 添加调试日志
  };

  const updateTheme = () => {
    // 更新HTML根元素的类名
    const htmlElement = document.documentElement;
    if (currentTheme.value === 'dark') {
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
    } else {
      htmlElement.classList.add('light');
      htmlElement.classList.remove('dark');
    }
    console.log('当前HTML类名:', htmlElement.classList); // 添加调试日志
  };
</script>

<style scoped lang="scss">
  .header {
    border: 0.01rem solid var(--border-color);
    background: var(--header-bg);
    // 移除可能导致右侧出现边框的设置
    border-right: none;
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
    color: var(--text-color);
  }

  .theme-toggle {
    padding: 0.5rem 1rem;
    background-color: var(--header-bg);
    border: 0.01rem solid var(--border-color);
    border-radius: 4px;
    color: var(--text-color);
    cursor: pointer;
  }
</style>
