<template>
  <div class="permission-member-container">
    <div class="form-item">
      <el-input v-model="user" style="width: 240px" placeholder="用户名" />
    </div>
    <div class="form-item">
      <el-input v-model="pass" style="width: 240px" placeholder="请输入密码" />
    </div>
    <div class="form-item">
      <el-button type="primary" @click="handleSubmit">注册</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { ElMessage } from 'element-plus';
  import { getLoginApp } from '../axios/lzyapi';

  const user = ref('');
  const pass = ref('');

  const handLogin = async (LoginApp?: { user: string; pass: string }) => {
    try {
      const response = await getLoginApp({
        user: LoginApp?.user || '',
        pass: LoginApp?.pass || '',
      });
      // @ts-expect-error 响应数据结构与TypeScript类型不匹配，临时忽略类型检查
      if (response.code === 200) {
        console.log('注册成功', response);
        ElMessage.success('注册用户成功');
      } else {
        console.log('注册失败', response);
        // @ts-expect-error 响应数据结构与TypeScript类型不匹配，临时忽略类型检查
        ElMessage.error(`注册失败: ${response.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('注册失败:', error);
      ElMessage.error('网络请求失败，请检查后端服务是否正常');
    }
  };
  const handleSubmit = () => {
    handLogin({ user: user.value, pass: pass.value });
  };
</script>

<style scoped lang="scss">
  .permission-member-container {
    padding: 20px;
  }

  .form-item {
    margin-bottom: 16px;
  }
</style>
