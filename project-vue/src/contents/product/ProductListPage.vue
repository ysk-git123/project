<template>
  <div class="product-list-page">
    <div class="page-header">
      <h2>商品列表</h2>
      <div class="header-actions">
        <el-button type="primary" :loading="loading" @click="refreshList">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && listData.length === 0" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-empty description="加载失败" :image-size="100">
        <el-button type="primary" @click="getList">
          重试
        </el-button>
      </el-empty>
    </div>

    <!-- 空状态 -->
    <div v-else-if="listData.length === 0" class="empty-container">
      <el-empty description="暂无商品数据" :image-size="100">
        <el-button type="primary" @click="getList">
          刷新
        </el-button>
      </el-empty>
    </div>

    <!-- 商品列表 -->
    <div v-else class="product-grid">
      <el-card v-for="item in listData" :key="item._id" class="product-card" shadow="hover">
        <div class="product-info">
          <h3 class="product-title">
            {{ item.title }}
          </h3>
          <div class="product-price">
            <span class="price-symbol">¥</span>
            <span class="price-value">{{ item.price }}</span>
          </div>
          <div class="product-meta">
            <el-tag :type="item.flag ? 'success' : 'info'" size="small">
              {{ item.flag ? '上架' : '下架' }}
            </el-tag>
            <span class="merchant-name">{{ item.merchant }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { getMerchantList, type MerchantListItem, type ApiResponse } from '../../axios/api';

const listData = ref<MerchantListItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const getList = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response: ApiResponse<MerchantListItem[]> = await getMerchantList();

    if (response.code === 200) {
      listData.value = response.data || [];
      console.log('商品列表获取成功:', response.data);
    } else {
      error.value = response.msg || '获取商品列表失败';
      ElMessage.error(error.value);
    }
  } catch (err: unknown) {
    console.error('获取商品列表失败:', err);
    const errorMessage = err instanceof Error ? err.message : '网络请求失败';
    error.value = errorMessage;
    ElMessage.error(errorMessage);
  } finally {
    loading.value = false;
  }
};

const refreshList = () => {
  getList();
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.product-list-page {
  padding: 1.5rem;
  min-height: 100vh;
  background-color: #f5f7fa;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    h2 {
      margin: 0;
      color: #303133;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }
  }

  .loading-container,
  .error-container,
  .empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;

    .product-card {
      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
      border: none;
      border-radius: 12px;
      overflow: hidden;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .product-info {
        padding: 1rem;

        .product-title {
          margin: 0 0 0.75rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #303133;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-price {
          margin-bottom: 1rem;
          display: flex;
          align-items: baseline;
          gap: 0.25rem;

          .price-symbol {
            font-size: 0.9rem;
            color: #f56c6c;
            font-weight: 500;
          }

          .price-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #f56c6c;
          }
        }

        .product-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .merchant-name {
            font-size: 0.85rem;
            color: #909399;
            font-weight: 500;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .product-list-page {
    padding: 1rem;

    .page-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;

      .header-actions {
        justify-content: center;
      }
    }

    .product-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
}
</style>
