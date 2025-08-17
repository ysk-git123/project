<template>
  <el-aside class="aside">
    <div class="aside-title" @click="handleAddFile">{{ props.title }}</div>
    <div
      v-for="item in props.navItems"
      :key="item.path"
      class="nav-link"
      @click="handleItemClick(item.path, item.text)"
    >
      {{ item.text }}
    </div>
  </el-aside>
</template>

<script setup lang="ts">
  import { defineEmits, defineProps } from 'vue';

  const props = defineProps<{
    title: string;
    navItems: Array<{ text: string; path: string }>;
  }>();

  const emit = defineEmits(['item-click', 'add-file']);

  const handleItemClick = (path: string, text: string) => {
    emit('item-click', path, text);
  };
  const handleAddFile = () => {
    emit('add-file');
  };
</script>

<style scoped lang="scss">
  .aside {
    width: 12.7rem;
    height: 38rem;
    background: var(--sidebar-bg);
    border: 0.01rem solid var(--border-color);
    overflow-y: auto;
  }

  .aside-title {
    width: 100%;
    border-bottom: 0.01rem solid var(--border-color);
    height: 3.65rem;
    text-align: center;
    line-height: 3.65rem;
    font-size: 1.2rem;
    color: var(--text-color);
  }

  .nav-link {
    width: 100%;
    height: 3rem;
    text-align: center;
    line-height: 3rem;
    border-bottom: 0.01rem solid var(--border-color);
    color: var(--text-color);
    cursor: pointer;
  }

  .nav-link:hover {
    background-color: var(--header-bg);
  }
</style>
