<template>
  <div>
    <h2>商品列表</h2>
    <div v-for="item in listData" :key="item._id">
      <p>{{ item.title }}</p>
      <p>{{ item.price }}元</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { getMerchantList } from '../../axios/api';

  interface MerchantListItem {
    _id: string;
    title: string;
    price: number;
    flag: boolean;
    merchant: string;
  }

  const listData = ref<MerchantListItem[]>([]);

  const getList = async () => {
    try {
      const response = await getMerchantList();
      // @ts-expect-error 响应数据结构与TypeScript类型不匹配，临时忽略类型检查
      if (response.code === 200) {
        listData.value = response.data || [];
      }
      console.log('列表', response);
    } catch (err) {
      console.error(err);
    }
  };

  onMounted(() => {
    getList();
  });
</script>

<style scoped lang="scss">
  .product-list-page {
    padding: 1.5rem;
  }
</style>
