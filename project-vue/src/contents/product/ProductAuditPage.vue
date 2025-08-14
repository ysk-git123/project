<template>
  <div class="product-audit-page">
    <el-card>
      <template #header>
        <h2>商品审核</h2>
      </template>
      
      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="filterStatus" placeholder="审核状态" clearable @change="handleFilterChange">
              <el-option label="全部" value="" />
              <el-option label="审核中" value="pending" />
              <el-option label="审核通过" value="approved" />
              <el-option label="审核失败" value="rejected" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filterCategory" placeholder="商品分类" clearable @change="handleFilterChange">
              <el-option label="全部分类" value="" />
              <el-option
                v-for="category in categories"
                :key="category"
                :label="category"
                :value="category"
              />
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索商品名称"
              @input="handleSearch"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="refreshList" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 审核统计 -->
      <div class="audit-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card pending">
              <div class="stat-content">
                <div class="stat-number">{{ stats.pending }}</div>
                <div class="stat-label">待审核</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card approved">
              <div class="stat-content">
                <div class="stat-number">{{ stats.approved }}</div>
                <div class="stat-label">已通过</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card rejected">
              <div class="stat-content">
                <div class="stat-number">{{ stats.rejected }}</div>
                <div class="stat-label">已拒绝</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card total">
              <div class="stat-content">
                <div class="stat-number">{{ stats.total }}</div>
                <div class="stat-label">总计</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 商品列表 -->
      <div class="product-list">
        <el-table
          :data="auditList"
          stripe
          border
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          v-loading="loading"
          table-layout="fixed"
          :fit="false"
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
          <el-table-column label="商品名称" prop="name" width="180">
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
          <el-table-column label="商品描述" prop="description" width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="description-text">{{ row.description }}</span>
            </template>
          </el-table-column>

          <!-- 价格 -->
          <el-table-column label="价格" prop="price" width="120" align="center">
            <template #default="{ row }">
              <span class="price-text">¥{{ row.price }}</span>
            </template>
          </el-table-column>

          <!-- 颜色 -->
          <el-table-column label="颜色" width="120" align="center">
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
          <el-table-column label="尺码" width="100" align="center">
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

          <!-- 审核状态 -->
          <el-table-column label="审核状态" width="120" align="center">
            <template #default="{ row }">
              <el-tag
                :type="getStatusTagType(row.status)"
                size="small"
                effect="light"
              >
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 创建时间 -->
          <el-table-column label="创建时间" prop="createTime" width="150" align="center">
            <template #default="{ row }">
              <span class="time-text">{{ formatTime(row.createTime) }}</span>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button 
                  v-if="row.status === 'pending'"
                  type="success" 
                  size="small" 
                  @click="handleApprove(row)"
                  class="action-btn approve-btn"
                  :icon="Check"
                >
                  通过
                </el-button>
                <el-button 
                  v-if="row.status === 'pending'"
                  type="danger" 
                  size="small" 
                  @click="handleReject(row)"
                  class="action-btn reject-btn"
                  :icon="Close"
                >
                  拒绝
                </el-button>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="handleView(row)"
                  class="action-btn view-btn"
                  :icon="View"
                >
                  查看
                </el-button>
                <el-button 
                  v-if="row.status === 'rejected'"
                  type="warning" 
                  size="small" 
                  @click="handleResubmit(row)"
                  class="action-btn resubmit-btn"
                  :icon="Refresh"
                >
                  重新提交
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
    </el-card>

    <!-- 拒绝原因对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝原因"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="rejectForm" ref="rejectFormRef" :rules="rejectRules">
        <el-form-item label="拒绝原因" prop="reason" label-width="80px">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmReject" :loading="rejecting">
            确认拒绝
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Check, Close, View } from '@element-plus/icons-vue';
import { getAuditProductList, auditProduct, resubmitProduct, getCategories, type AuditProductParams, type AuditProductItem } from '../../axios/api';

// 定义错误类型
interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

// 使用从API文件导入的AuditProductItem类型

interface PaginationData {
  current: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// 筛选条件
const filterStatus = ref('');
const filterCategory = ref('');
const searchKeyword = ref('');

// 数据列表
const auditList = ref<AuditProductItem[]>([]);
const loading = ref(false);
const categories = ref<string[]>([]);

// 分页数据
const pagination = ref<PaginationData>({
  current: 1,
  pageSize: 10,
  total: 0,
  hasMore: false
});

// 审核统计
const stats = computed(() => {
  const pending = auditList.value.filter(item => item.status === 'pending').length;
  const approved = auditList.value.filter(item => item.status === 'approved').length;
  const rejected = auditList.value.filter(item => item.status === 'rejected').length;
  const total = auditList.value.length;
  
  return { pending, approved, rejected, total };
});

// 拒绝对话框
const rejectDialogVisible = ref(false);
const rejectForm = reactive({
  productId: '',
  reason: ''
});
const rejectFormRef = ref();
const rejecting = ref(false);

const rejectRules = {
  reason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' },
    { min: 5, max: 200, message: '拒绝原因长度在 5 到 200 个字符', trigger: 'blur' }
  ]
};

// 获取审核商品列表
const getAuditList = async () => {
  loading.value = true;
  
  try {
    // 构建查询参数
    const params: AuditProductParams = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize
    };
    
    if (filterStatus.value && filterStatus.value !== '') {
      params.status = filterStatus.value;
    }
    
    if (filterCategory.value && filterCategory.value !== '') {
      params.category = filterCategory.value;
    }
    
    if (searchKeyword.value.trim()) {
      params.search = searchKeyword.value.trim();
    }
    
    // 调用真实API获取审核商品列表
    const response = await getAuditProductList(params);
    
    if (response.success && response.data) {
      auditList.value = response.data.list || [];
      pagination.value.total = response.data.pagination.total;
      pagination.value.current = response.data.pagination.current;
      pagination.value.pageSize = response.data.pagination.pageSize;
    } else {
      ElMessage.error(response.message || '获取审核商品列表失败');
      auditList.value = [];
      pagination.value.total = 0;
    }
    
  } catch (err: unknown) {
    console.error('获取审核商品列表失败:', err);
    
    // 如果是401错误，让axios拦截器处理token刷新
    if (err && typeof err === 'object' && 'response' in err && 
        (err as ApiError).response?.status === 401) {
      // 不显示错误信息，让axios拦截器处理
      console.log('检测到401错误，等待token刷新...');
      
      // 重要：重新抛出错误，让axios拦截器处理
      throw err;
    }
    
    // 其他错误才显示错误信息
    const errorMessage = err && typeof err === 'object' && 'response' in err 
      ? (err as ApiError).response?.data?.message 
      : '获取审核商品列表失败';
    ElMessage.error(errorMessage);
    auditList.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

// 获取分类列表
const getCategoriesList = async () => {
  try {
    // 调用真实API获取分类列表
    const response = await getCategories();
    if (response.success && response.data) {
      categories.value = response.data || [];
    } else {
      console.error('获取分类失败:', response.message);
      categories.value = [];
    }
  } catch (err) {
    console.error('获取分类失败:', err);
    categories.value = [];
  }
};

// 筛选变化
const handleFilterChange = () => {
  pagination.value.current = 1;
  getAuditList();
};

// 搜索
const handleSearch = () => {
  pagination.value.current = 1;
  getAuditList();
};

// 刷新列表
const refreshList = () => {
  getAuditList();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.current = 1;
  getAuditList();
};

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.value.current = page;
  getAuditList();
};

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  };
  return typeMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'pending': '审核中',
    'approved': '审核通过',
    'rejected': '审核失败'
  };
  return textMap[status] || '未知';
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
    '棕色': '#a0522d'
  };
  return colorMap[color] || '#d9d9d9';
};

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleDateString('zh-CN');
};

// 获取图片URL
const getImageUrl = (imagePath: string) => {
  if (!imagePath) {
    return '/img/1.jpg';
  }
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  return `/img/${imagePath}`;
};

// 处理图片加载失败
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/img/1.jpg';
  target.onerror = null;
};

// 审核通过
const handleApprove = async (row: AuditProductItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要通过商品 "${row.name}" 的审核吗？`,
      '确认审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
      }
    );
    
    // 调用真实API审核通过
    const response = await auditProduct(row._id, 'approve');
    if (response.success) {
      ElMessage.success('审核通过成功');
      getAuditList(); // 刷新列表
    } else {
      ElMessage.error(response.message || '审核失败');
    }
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核通过失败:', error);
      ElMessage.error('审核操作失败，请重试');
    }
  }
};

// 审核拒绝
const handleReject = (row: AuditProductItem) => {
  rejectForm.productId = row._id;
  rejectForm.reason = '';
  rejectDialogVisible.value = true;
};

// 确认拒绝
const confirmReject = async () => {
  if (!rejectFormRef.value) return;
  
  try {
    await rejectFormRef.value.validate();
    
    rejecting.value = true;
    
    // 调用真实API审核拒绝
    const response = await auditProduct(rejectForm.productId, 'reject', rejectForm.reason);
    if (response.success) {
      ElMessage.success('审核拒绝成功');
      rejectDialogVisible.value = false;
      getAuditList(); // 刷新列表
    } else {
      ElMessage.error(response.message || '审核拒绝失败');
    }
    
  } catch (error) {
    console.error('拒绝操作失败:', error);
    ElMessage.error('审核拒绝失败，请重试');
  } finally {
    rejecting.value = false;
  }
};

  // 查看商品
  const handleView = (_row: AuditProductItem) => {
    
    ElMessage.info('查看功能开发中...');
  };

// 重新提交
const handleResubmit = async (row: AuditProductItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要重新提交商品 "${row.name}" 吗？`,
      '确认重新提交',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 调用真实API重新提交商品
    const response = await resubmitProduct(row._id);
    if (response.success) {
      ElMessage.success('重新提交成功');
      getAuditList(); // 刷新列表
    } else {
      ElMessage.error(response.message || '重新提交失败');
    }
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重新提交失败:', error);
      ElMessage.error('重新提交失败，请重试');
    }
  }
};

onMounted(() => {
  getCategoriesList();
  getAuditList();
});
</script>

<style scoped lang="scss">
  .product-audit-page {
    padding: 1.5rem;
  
  .filter-section {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .audit-stats {
    margin-bottom: 2rem;
    
    .stat-card {
      text-align: center;
      border: none;
      
      &.pending {
        .stat-content {
          color: #e6a23c;
        }
      }
      
      &.approved {
        .stat-content {
          color: #67c23a;
        }
      }
      
      &.rejected {
        .stat-content {
          color: #f56c6c;
        }
      }
      
      &.total {
        .stat-content {
          color: #409eff;
        }
      }
      
      .stat-content {
        padding: 1rem;
        
        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: #606266;
        }
      }
    }
  }
  
  .product-list {
    margin-bottom: 2rem;
    
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
        transition: all 0.2s ease;
        cursor: pointer;
        min-width: 80px;
        justify-content: center;

        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: nowrap;
      align-items: center;

      .action-btn {
        min-width: 50px;
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

        &:active {
          transform: translateY(0);
        }

        &.approve-btn {
          background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
          border-color: #67c23a;
          color: white;

          &:hover {
            background: linear-gradient(135deg, #85ce61 0%, #67c23a 100%);
            border-color: #85ce61;
          }
        }

        &.reject-btn {
          background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
          border-color: #f56c6c;
          color: white;

          &:hover {
            background: linear-gradient(135deg, #f78989 0%, #f56c6c 100%);
            border-color: #f78989;
          }
        }

        &.view-btn {
          background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
          border-color: #409eff;
          color: white;

          &:hover {
            background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
            border-color: #66b1ff;
          }
        }

        &.resubmit-btn {
          background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
          border-color: #e6a23c;
          color: white;

          &:hover {
            background: linear-gradient(135deg, #ebb563 0%, #e6a23c 100%);
            border-color: #ebb563;
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
  .product-audit-page {
    padding: 1rem;
    
    .filter-section {
      .el-row {
        .el-col {
          margin-bottom: 1rem;
        }
      }
    }
    
    .audit-stats {
      .el-row {
        .el-col {
          margin-bottom: 1rem;
        }
      }
    }
  }
  }
</style>
