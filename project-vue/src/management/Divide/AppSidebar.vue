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
    background: rgb(244, 244, 244);
    border: 0.01rem solid rgb(218, 218, 218);
    overflow-y: auto;
  }

  .aside-title {
    width: 100%;
    border-bottom: 0.01rem solid rgb(217, 217, 217);
    height: 3.65rem;
    text-align: center;
    line-height: 3.65rem;
    font-size: 1.2rem;
    color: rgb(60, 60, 60);
  }

  .nav-link {
    width: 100%;
    height: 3rem;
    text-align: center;
    line-height: 3rem;
    border-bottom: 0.01rem solid rgb(220, 220, 220);
    color: rgb(105, 105, 105);
    cursor: pointer;
  }

  .nav-link:hover {
    background-color: #f0f0f0;
  }
</style>
