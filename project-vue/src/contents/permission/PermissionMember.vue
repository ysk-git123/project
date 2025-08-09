<template>
  <div class="permission-member-container">
    <div class="form-item">
      <el-input v-model="user" style="width: 240px" placeholder="用户名" />
    </div>
    <div class="form-item">
      <el-input v-model="pass" style="width: 240px" placeholder="请输入密码" />
    </div>
    <div class="form-item">
      <el-select v-model="relo" placeholder="请选择角色" style="width: 240px">
        <el-option
          v-for="option in options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </div>
    <div class="form-item">
      <!-- {{ idup }} -->
      <el-button type="primary" :disabled="isButtonDisabled" @click="handLogin">提交</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { ElMessage } from 'element-plus';
  import { getMerchantRole, getLoginAppId, getLoginAddRole } from '../../axios/lzyapi';
  interface User {
    _id: string;
    userAM: string;
    username: string;
    Authoritys: string;
    merchantCode: string;
    flag: boolean;
  }
  const user = ref('');
  const pass = ref('');
  const relo = ref('');
  const idup = ref('');
  const loginList = ref<User[]>([]);
  const isButtonDisabled = ref(true);
  console.log(loginList);
  const options = ref([
    { value: '请选择角色', label: '请选择角色' },
    { value: '运营', label: '运营' },
    { value: '财务', label: '财务' },
    { value: '统计', label: '统计' },
  ]);
  const getOptions = async () => {
    try {
      const res = await getMerchantRole();
      if (res.data && res.data.list) {
        // 定义角色项的类型
        interface RoleItem {
          roleName: string;
        }

        options.value = res.data.list.map((item: RoleItem) => ({
          value: item.roleName,
          label: item.roleName,
        }));
        console.log('从后端获取角色列表成功:', options.value);
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
      ElMessage.error('获取角色列表失败');
    }
  };
  const getLoginId = async () => {
    try {
      const res = await getLoginAppId();
      // @ts-expect-error 响应数据结构与TypeScript类型不匹配，临时忽略类型检查
      if (res.code === 200) {
        loginList.value = res.data || [];
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
    }
  };
  watch(user, (newValue) => {
    if (newValue) {
      const foundUser = loginList.value.find((item) => item.username === newValue);
      if (foundUser) {
        idup.value = foundUser._id;
        isButtonDisabled.value = false;
      } else {
        idup.value = '用户名不存在';
        isButtonDisabled.value = true;
      }
    } else {
      idup.value = 'id';
      isButtonDisabled.value = true;
    }
  });
  // 可选：从后端获取角色列表
  onMounted(() => {
    getOptions();
    getLoginId();
  });

  const handLogin = async () => {
    try {
      // 检查是否选择了角色
      if (!relo.value) {
        ElMessage.warning('请选择角色');
        return;
      }

      // 准备要发送的数据
      const postData = {
        userAM: idup.value, // 把idup的值给userAM
        username: user.value, // 用户名
        Authoritys: relo.value, // 角色权限
        flag: true, // 设置flag为true
      };
      // console.log(postData);
      const res = await getLoginAddRole(postData);
      // @ts-expect-error 响应数据结构与TypeScript类型不匹配，临时忽略类型检查
      if (res.code === 200) {
        console.log('提交成功', res);
        ElMessage.success('添加角色信息成功');
        // 重置表单
        user.value = '';
        pass.value = '';
        relo.value = '';
      } else {
        // @ts-expect-error 响应数据结构与TypeScript类型不匹配，临时忽略类型检查
        ElMessage.error('添加角色信息失败: ' + res.msg);
      }
    } catch (error) {
      console.error('添加失败', error);
      ElMessage.error('添加角色信息时发生错误');
    }
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
