<template>
  <div class="permission-user-container">
    <div class="page-header">
      <h2>用户权限管理</h2>
    </div>

    <div class="search-bar">
      <el-input v-model="username" placeholder="请输入用户名" class="search-input" />
      <el-input v-model="Authoritys" placeholder="请输入角色" class="search-input" />
      <el-button type="primary" class="search-btn" @click="getTableScheat">查询</el-button>
      <el-button type="primary" class="add-btn" @click="getTableAdd">添加成员</el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" class="custom-table">
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="80">
          <template #default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column property="username" label="操作者" width="200" />
        <el-table-column property="Authoritys" label="角色" width="200" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button type="primary" size="small" class="edit-btn" @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="small"
              class="delete-btn"
              @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页控件 -->
    <div v-if="tableData.length > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { getMerchantRole, deleteMerchantRole } from '../../axios/lzyapi';
  import { ElMessageBox, ElMessage } from 'element-plus';

  interface User {
    _id: string;
    username: string;
    Authoritys: string;
  }

  const tableData = ref<User[]>([]);
  const username = ref('');
  const Authoritys = ref('');
  const route = useRouter();
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  // 渲染数据接口
  const getTableData = async (filterParams?: { username?: string; Authoritys?: string }) => {
    try {
      const response = await getMerchantRole(filterParams);
      console.log(response);
      // @ts-expect-error 响应数据结构与TypeScript类型不匹配，临时忽略类型检查
      if (response.code === 200) {
        tableData.value = response.data || [];
        // @ts-expect-error 假设响应中包含total字段
        total.value = response.total || 0;
      }
    } catch (err) {
      console.log(err);
    }
  };

  onMounted(() => {
    getTableData();
  });

  // 添加按钮
  const getTableAdd = () => {
    route.push('/framework/permission/PermissionMember');
  };

  // 编辑按钮
  const handleEdit = (row: User) => {
    // 这里可以实现编辑功能，例如跳转到编辑页面或打开编辑弹窗
    ElMessage.info(`编辑用户: ${row.username}`);
    // 实际项目中可以添加路由跳转或弹窗逻辑
    // route.push({ path: '/framework/permission/edit', query: { id: row._id } });
  };

  // 删除按钮
  const handleDelete = (row: User) => {
    ElMessageBox.confirm('确定要删除这个用户吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        try {
          const response = await deleteMerchantRole(row._id);
          // @ts-expect-error 响应数据结构与TypeScript类型不匹配，临时忽略类型检查
          if (response.code === 200) {
            ElMessage.success('删除成功');
            // 刷新表格数据
            getTableData();
          } else {
            // @ts-expect-error 响应数据结构与TypeScript类型不匹配，临时忽略类型检查
            ElMessage.error('删除失败: ' + response.msg);
          }
        } catch (err) {
          console.error('删除失败:', err);
          ElMessage.error('删除失败，请重试');
        }
      })
      .catch(() => {
        ElMessage.info('已取消删除');
      });
  };

  // 搜索按钮
  const getTableScheat = () => {
    // 重置当前页码
    currentPage.value = 1;
    // 当两个输入框都是空的时候，不带参数调用 getTableData
    if (!username.value && !Authoritys.value) {
      getTableData();
    } else {
      getTableData({
        username: username.value,
        Authoritys: Authoritys.value,
      });
    }
  };

  // 分页处理
  const handleSizeChange = (size: number) => {
    pageSize.value = size;
    getTableData();
  };

  const handleCurrentChange = (current: number) => {
    currentPage.value = current;
    getTableData();
  };
</script>

<style scoped lang="scss">
  .permission-user-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
  }

  .page-header {
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;
  }

  .page-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2d3d;
    margin: 0;
  }

  .search-bar {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    padding: 16px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    flex-wrap: wrap;
    gap: 16px;
  }

  .search-input {
    width: 240px;
    height: 40px;
  }

  .search-btn,
  .add-btn {
    height: 40px;
    padding: 0 20px;
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  .add-btn {
    background-color: #67c23a;
    border-color: #67c23a;

    &:hover {
      background-color: #529b2e;
      border-color: #529b2e;
    }
  }

  .table-container {
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  .custom-table {
    border-collapse: collapse;

    .el-table__header th {
      background-color: #f7f8fa;
      font-weight: 600;
      color: #1f2d3d;
      border-bottom: 1px solid #e4e7ed;
    }

    .el-table__body td {
      border-bottom: 1px solid #e4e7ed;
      padding: 12px 0;
    }

    .el-table__body tr {
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #f5f7fa;
      }
    }

    .el-table__empty-block {
      height: 200px;
    }
  }

  .edit-btn,
  .delete-btn {
    margin-right: 8px;
    transition: all 0.3s ease;
  }

  .delete-btn {
    &:hover {
      background-color: #f56c6c;
      border-color: #f56c6c;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    padding: 10px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }

  /* 响应式设计 */
  @media (max-width: 1200px) {
    .search-input {
      width: 200px;
    }
  }

  @media (max-width: 992px) {
    .search-bar {
      flex-direction: column;
      align-items: stretch;
    }

    .search-input {
      width: 100%;
    }

    .search-btn,
    .add-btn {
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    .permission-user-container {
      padding: 10px;
    }

    .custom-table {
      display: block;
      overflow-x: auto;
      white-space: nowrap;
    }
  }
</style>
