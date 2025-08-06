<template>
  <div>
    <el-input v-model="username" style="width: 240px" placeholder="请输入用户名" />&nbsp;
    <el-input v-model="Authoritys" style="width: 240px" placeholder="请输入角色" />&nbsp;
    <el-button type="primary" @click="getTableScheat">查询</el-button>&nbsp;
    <el-button type="primary">新增</el-button>
  </div>
  <div class="permission-user">
    <el-table :data="tableData" style="width: 100%">
      <el-table-column type="selection" width="55" />
      <el-table-column label="序号" width="200">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column property="username" label="操作者" width="200" />
      <el-table-column property="Authoritys" label="角色" width="200" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { getMerchantRole } from '../../axios/lzyapi';
  interface User {
    _id: string;
    username: string;
    Authoritys: string;
  }
  const tableData = ref<User[]>([]);
  const username = ref('');
  const Authoritys = ref('');

  // 渲染数据接口
  const getTableData = async (filterParams?: { username?: string; Authoritys?: string }) => {
    try {
      const response = await getMerchantRole(filterParams);
      console.log(response);
      // @ts-expect-error 响应数据结构与TypeScript类型不匹配，临时忽略类型检查
      if (response.code === 200) {
        tableData.value = response.data || [];
      }
    } catch (err) {
      console.log(err);
    }
  };
  onMounted(() => {
    getTableData();
  });

  // 编辑按钮
  const handleEdit = (row: User) => {
    console.log(row);
  };

  // 搜索按钮
  const getTableScheat = () => {
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
</script>

<style scoped lang="scss"></style>
