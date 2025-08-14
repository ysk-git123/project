<template>
  <div class="product-list-page">
    <div class="page-header">
      <h2>商品列表</h2>
      <div class="header-actions">
        <!-- 分类筛选 -->
        <el-select v-model="selectedCategory" placeholder="选择分类" @change="handleCategoryChange" clearable>
          <el-option label="全部分类" value="all" />
          <el-option
            v-for="category in categories"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
        
        <!-- 搜索框 -->
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品名称"
          class="search-input"
          @input="handleSearch"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-button type="primary" :loading="loading" @click="refreshList">
          <el-icon><Refresh /></el-icon>
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

    <!-- 商品列表表格 -->
    <div v-else class="product-table-container">
      <el-table
        :data="listData"
        stripe
        border
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        table-layout="auto"
        :fit="true"
      >
        <!-- 商品图片 -->
        <el-table-column label="商品图片" width="100" align="center">
          <template #default="{ row }">
            <img
              :src="getImageUrl(row.image)"
              :alt="row.name"
              style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;"
              @error="handleImageError"
            />
          </template>
        </el-table-column>

        <!-- 商品名称 -->
        <el-table-column label="商品名称" prop="name" min-width="160">
          <template #default="{ row }">
            <div class="product-name">
              <div class="name-container">
                <span class="name-text" :title="row.name">{{ row.name }}</span>
                <div class="name-actions">
                  <el-tag 
                    :type="getCategoryTagType(row.category)" 
                    size="small" 
                    class="category-tag"
                    effect="light"
                  >
                {{ row.category }}
              </el-tag>
                  <el-tag 
                    v-if="row.stock !== undefined" 
                    :type="row.stock > 0 ? 'success' : 'danger'" 
                    size="small" 
                    class="stock-tag"
                    effect="light"
                  >
                    {{ row.stock > 0 ? `库存: ${row.stock}` : '缺货' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 商品描述 -->
        <el-table-column label="商品描述" prop="description" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="description-text">{{ row.description }}</span>
          </template>
        </el-table-column>

        <!-- 价格 -->
        <el-table-column label="价格" prop="price" min-width="100" align="center">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.price }}</span>
          </template>
        </el-table-column>

        <!-- 颜色 -->
        <el-table-column label="颜色" min-width="120" align="center">
          <template #default="{ row }">
            <div v-if="row.color && row.color.length > 0" class="color-chips">
              <div
                v-for="color in row.color"
                :key="color"
                class="color-item"
                :title="color"
              >
                <span 
                  class="color-chip"
                  :style="{ backgroundColor: getColorValue(color) }"
              ></span>
                <span class="color-name">{{ color }}</span>
              </div>
            </div>
            <span v-else class="no-data">-</span>
          </template>
        </el-table-column>

        <!-- 尺码 -->
        <el-table-column label="尺码" min-width="100" align="center">
          <template #default="{ row }">
            <div v-if="row.size && row.size.length > 0" class="size-chips">
              <el-tag
                v-for="size in row.size"
                :key="size"
                size="small"
                type="info"
                class="size-tag"
              >
                {{ size }}
              </el-tag>
            </div>
            <span v-else class="no-data">-</span>
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column label="创建时间" prop="createTime" min-width="120" align="center">
          <template #default="{ row }">
            <span class="time-text">{{ formatTime(row.createTime) }}</span>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" min-width="140" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleEdit(row)"
                class="action-btn edit-btn"
                :icon="Edit"
              >
              编辑
            </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="handleDelete(row)"
                class="action-btn delete-btn"
                :icon="Delete"
              >
              删除
            </el-button>
              <el-button 
                type="info" 
                size="small" 
                @click="handleView(row)"
                class="action-btn view-btn"
                :icon="View"
              >
                查看
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页器 -->
    <div v-if="pagination.total > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh, Search, Edit, Delete, View } from '@element-plus/icons-vue';
import { getMerchantList, getCategories, type ProductListParams } from '../../axios/api';

// 定义后端数据结构
interface ProductItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  color: string[];
  size: string[];
  description: string;
  category: string;
  createTime: string;
}

interface PaginationData {
  current: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// 使用统一的API响应类型
interface BackendResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

interface ProductListResponse {
  list: ProductItem[];
  pagination: PaginationData;
}


const listData = ref<ProductItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const categories = ref<string[]>([]);
const selectedCategory = ref<string>('all');
const searchKeyword = ref<string>('');

// 分页数据
const pagination = ref<PaginationData>({
  current: 1,
  pageSize: 10,
  total: 0,
  hasMore: false
});

// 获取商品列表
const getList = async () => {
  loading.value = true;
  error.value = null;

  try {
    
    
    // 构建查询参数
    const params: ProductListParams = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize
    };
    
    if (selectedCategory.value && selectedCategory.value !== 'all') {
      params.category = selectedCategory.value;
    }
    
    if (searchKeyword.value.trim()) {
      params.search = searchKeyword.value.trim();
    }
    
    
    
    const response: BackendResponse<ProductListResponse> = await getMerchantList(params);
    

    if (response.success) {
      listData.value = response.data.list || [];
      pagination.value = response.data.pagination;
      
    } else {
      error.value = response.message || '获取商品列表失败';
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

// 获取分类列表
const getCategoriesList = async () => {
  try {
    const response: BackendResponse<string[]> = await getCategories();
    if (response.success) {
      categories.value = response.data || [];
    }
  } catch (err) {
    console.error('获取分类失败:', err);
  }
};

// 处理分类变化
const handleCategoryChange = () => {
  pagination.value.current = 1;
  getList();
};

// 处理搜索
const handleSearch = () => {
  pagination.value.current = 1;
  getList();
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.current = 1;
  getList();
};

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  pagination.value.current = page;
  getList();
};

// 刷新列表
const refreshList = () => {
  getList();
};



// 获取分类标签类型
const getCategoryTagType = (category: string) => {
  const typeMap: Record<string, string> = {
    'clothing': 'primary',
    'shoes': 'success',
    'accessories': 'warning',
    'electronics': 'danger'
  };
  return typeMap[category] || 'info';
};

// 获取颜色值
const getColorValue = (color: string) => {
  const colorMap: Record<string, string> = {
    '白色': '#ffffff',
    '黑色': '#000000',
    '蓝色': '#1890ff',
    '红色': '#f5222d',
    '绿色': '#52c41a',
    '黄色': '#faad14',
    '紫色': '#722ed1',
    '橙色': '#fa8c16',
    '粉色': '#eb2f96',
    '灰色': '#8c8c8c',
    '棕色': '#a0522d',
    '深蓝': '#096dd9',
    '浅蓝': '#91d5ff',
    '深红': '#a8071a',
    '浅红': '#ffa39e',
    '深绿': '#389e0d',
    '浅绿': '#b7eb8f',
    '深黄': '#d48806',
    '浅黄': '#ffe58f',
    '深紫': '#531dab',
    '浅紫': '#d3adf7',
    '深橙': '#d46b08',
    '浅橙': '#ffd591',
    '深粉': '#c41d7f',
    '浅粉': '#fbb6ce',
    '深灰': '#595959',
    '浅灰': '#d9d9d9',
    '深棕': '#8b4513',
    '浅棕': '#d2691e',
    '米色': '#f5f5dc',
    '卡其': '#f4a460',
    '藏青': '#191970',
    '酒红': '#800020',
    '墨绿': '#006400',
    '天蓝': '#87ceeb',
    '玫瑰金': '#e8b4b8',
    '香槟': '#f7e7ce'
  };
  return colorMap[color] || '#d9d9d9';
};

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleDateString('zh-CN');
};

// 处理编辑
  const handleEdit = (_row: ProductItem) => {
    
  ElMessage.info('编辑功能开发中...');
};

// 处理删除
const handleDelete = (row: ProductItem) => {
  ElMessageBox.confirm(
    `确定要删除商品 "${row.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {

    ElMessage.success('删除成功');
    getList(); // 刷新列表
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

  // 处理查看
  const handleView = (_row: ProductItem) => {
    
    ElMessage.info('查看功能开发中...');
};

// 获取图片URL
const getImageUrl = (imagePath: string) => {
  if (!imagePath) {
    // 如果没有图片路径，返回默认图片
    return '/img/1.jpg';
  }
  
  // 如果已经是完整的URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // 如果是相对路径，添加public目录前缀
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // 默认从public/img目录加载
  return `/img/${imagePath}`;
};

// 处理图片加载失败
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/img/1.jpg'; // 设置默认图片
  target.onerror = null; // 防止重复触发
};


onMounted(() => {
  getCategoriesList();
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
      gap: 1rem;
      align-items: center;
      
      .search-input {
        width: 250px;
      }
      
      .el-select {
        width: 150px;
      }
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

  .product-table-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-top: 1rem;

    .product-name {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.5rem 0;

      .name-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .name-text {
        font-weight: 600;
        color: #303133;
          font-size: 0.95rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          transition: color 0.2s ease;

          &:hover {
            color: #409eff;
            text-decoration: underline;
          }
        }

        .name-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          align-items: center;

      .category-tag {
            font-size: 0.75rem;
            padding: 0.125rem 0.5rem;
            border-radius: 12px;
            font-weight: 500;
            border: 1px solid transparent;
            transition: all 0.2s ease;

            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }
          }

          .stock-tag {
            font-size: 0.75rem;
            padding: 0.125rem 0.5rem;
            border-radius: 12px;
            font-weight: 500;
            border: 1px solid transparent;
            transition: all 0.2s ease;

            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }
          }
        }
      }
    }

    .description-text {
      color: #606266;
      line-height: 1.4;
    }

    .price-text {
      font-size: 1.1rem;
      font-weight: 700;
      color: #f56c6c;
    }

    .color-chips {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      justify-content: center;
      align-items: center;

      .color-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.5rem;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid #e8e8e8;
        transition: border-color 0.2s ease;
        cursor: pointer;
        width: 80px;
        justify-content: center;

        &:hover {
          border-color: #d9d9d9;
          background: rgba(255, 255, 255, 0.95);
        }

        .color-chip {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          flex-shrink: 0;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 50%;
            border: 1px solid rgba(0, 0, 0, 0.1);
            pointer-events: none;
          }
        }

        .color-name {
          font-size: 0.75rem;
          color: #606266;
          font-weight: 500;
          white-space: nowrap;
          line-height: 1;
        }
      }
    }

    .size-chips {
      display: flex;
      gap: 0.3rem;
      justify-content: center;
      flex-wrap: wrap;

      .size-tag {
        margin: 0;
      }
    }

    .time-text {
      color: #909399;
      font-size: 0.9rem;
    }

    .no-data {
      color: #c0c4cc;
      font-style: italic;
    }

    .action-buttons {
      display: flex;
      gap: 0.4rem;
      justify-content: center;
      flex-wrap: nowrap;
      align-items: center;
      width: 100%;

              .action-btn {
          flex: 1;
          height: 28px;
          font-size: 0.75rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          white-space: nowrap;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }



        &.edit-btn {
          background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
          border-color: #409eff;
          color: white;

          &:hover {
            background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
            border-color: #66b1ff;
          }
        }

        &.delete-btn {
          background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
          border-color: #f56c6c;
          color: white;

          &:hover {
            background: linear-gradient(135deg, #f78989 0%, #f56c6c 100%);
            border-color: #f78989;
          }
        }

        &.view-btn {
          background: linear-gradient(135deg, #909399 0%, #c0c4cc 100%);
          border-color: #909399;
          color: white;

          &:hover {
            background: linear-gradient(135deg, #c0c4cc 0%, #909399 100%);
            border-color: #c0c4cc;
          }
        }
      }
    }
  }

  .pagination-container {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
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
