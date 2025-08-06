<template>
  <div>
    <h1>系统首页</h1>
    <div class="content">
      <div v-if="loading">
        <p>加载中...</p>
      </div>
      <div v-else-if="error">
        <p class="error-message">{{ error }}</p>
      </div>
      <div v-else-if="contextData && contextData.length > 0">
        <div class="context-items">
          <div v-for="item in contextData" :key="item._id" class="context-item">
            <h3>{{ item.sjMerchantCode }}</h3>
            <p>{{ item.sell }}</p>
          </div>
        </div>
      </div>
      <div v-else>
        <p>没有找到数据</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useStore } from 'vuex';
  import { getMerchantContext } from '../../axios/lzyapi';

  // 在脚本开头添加接口定义
  interface MerchantContextItem {
    _id: string;
    sjMerchantCode: string;
    sell: string;
  }

  const store = useStore();
  const contextData = ref<MerchantContextItem[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  // 页面加载时获取商家数据
  onMounted(async () => {
    try {
      console.log('开始获取商家数据');
      // 确保用户已登录且有merchantCode
      if (!store.state.isLoggedIn || !store.state.userInfo?.merchantCode) {
        throw new Error('用户未登录或缺少商家标识');
      }

      console.log('当前商家代码:', store.state.userInfo.merchantCode);
      const response = await getMerchantContext();
      console.log('请求响应:', response);
      // @ts-expect-error 响应数据结构与TypeScript类型不匹配，临时忽略类型检查
      if (response.code === 200) {
        // 注意：这里可能是问题所在，检查response的结构
        contextData.value = response.data || [];
        console.log('设置的数据:', contextData.value);
      } else {
        // @ts-expect-error 响应数据结构与TypeScript类型不匹配，临时忽略类型检查
        error.value = `请求失败: ${response.msg || '未知错误'}`;
      }
    } catch (err) {
      console.error('获取商家数据失败:', err);
      error.value = `获取数据失败: ${err instanceof Error ? err.message : String(err)}`;
      // 输出请求头信息以便调试
      const headers = {
        Authorization: store.state.accessToken ? `Bearer ${store.state.accessToken}` : '无',
        'Merchant-Code':
          store.state.userInfo && store.state.userInfo.merchantCode
            ? store.state.userInfo.merchantCode
            : '无',
      };
      console.log('请求头信息:', headers);
    } finally {
      loading.value = false;
    }
  });
</script>

<style scoped lang="scss">
  .home-container {
    padding: 20px;
  }

  .loading,
  .error {
    padding: 20px;
    text-align: center;
  }

  .error {
    color: #f56c6c;
  }

  .content {
    margin-top: 20px;
  }

  .context-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .context-item {
    padding: 15px;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .error-message {
    color: #f56c6c;
    padding: 10px;
    border: 1px solid #f56c6c;
    border-radius: 4px;
  }
</style>
