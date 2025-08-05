<template>
  <div class="login-container">
    <div class="login-page">
      <h3>欢迎登录!</h3>
      <div class="login-btn">
        <el-form
          ref="ruleFormRef"
          style="max-width: 600px"
          :model="ruleForm"
          status-icon
          :rules="rules"
          label-width="auto"
          class="demo-ruleForm"
        >
          <el-form-item prop="username">
            <el-input v-model="ruleForm.username" placeholder="请输入用户名" autocomplete="off" />
          </el-form-item>
          <el-form-item prop="pass">
            <el-input
              v-model="ruleForm.pass"
              placeholder="请输入密码"
              type="password"
              autocomplete="off"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="dl_btn" @click="submitForm(ruleFormRef)">
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="link-container">
        <p @click="HandeRegister">注册</p>
        <p @click="HandeForget">忘记密码</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  // @ts-expect-error 处理导入类型可能存在的兼容性问题
  import type { ElFormItem, FormInstance, FormRules, FormRule } from 'element-plus';
  import { ElMessage } from 'element-plus';
  import { useRouter } from 'vue-router';
  import { useStore } from 'vuex';
  import { login } from '../axios/api';
  const store = useStore();
  const router = useRouter();
  const ruleFormRef = ref<FormInstance>();
  const HandeRegister = () => {
    router.push('/register');
  };
  const HandeForget = () => {
    router.push('/forget');
  };

  const validatePass = (rule: FormRule, value: string, callback: (error?: Error) => void) => {
    if (value === '') {
      callback(new Error('请输入密码'));
    } else if (value.length < 6) {
      callback(new Error('密码长度不能少于6位'));
    } else {
      callback();
    }
  };

  const validateUsername = (rule: FormRule, value: string, callback: (error?: Error) => void) => {
    if (value === '') {
      callback(new Error('请输入用户名'));
    } else {
      callback();
    }
  };

  const ruleForm = reactive({
    username: '',
    pass: '',
  });

  const rules = reactive<FormRules<typeof ruleForm>>({
    username: [{ validator: validateUsername, trigger: 'blur' }],
    pass: [{ validator: validatePass, trigger: 'blur' }],
  });

  const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    try {
      await formEl.validate();
      const res = await login({
        username: ruleForm.username,
        password: ruleForm.pass,
      });
      console.log(
        '用户名: ' + res.data.username,
        '权限: ' + res.data.role,
        'userId: ' + res.data.userId,
        '商家编号: ' + res.data.merchantCode,
      );
      store.commit('login', {
        accessToken: res.data.accessToken, //假设API返回的token是accessToken
        refreshToken: res.data.refreshToken || '', //假设API返回的token是refreshToken
        userInfo: {
          username: res.data.username,
          role:
            res.data.role === '商家'
              ? 'merchant'
              : res.data.role === '超级管理员'
                ? 'admin'
                : res.data.role === '运营'
                  ? 'operating'
                  : res.data.role === '统计'
                    ? 'statistics'
                    : res.data.role === '财务'
                      ? 'finance'
                      : res.data.role,
          userId: res.data.userId,
          merchantCode: res.data.merchantCode,
        },
      });
      ElMessage.success({ message: '登录成功', duration: 1000 });
      router.push('/framework/home/SystemHomePage');
    } catch {
      ElMessage.error('登录失败');
    }
  };
</script>

<style scoped lang="scss">
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 97vh;
    margin: 0;
    padding: 0;
  }
  .login-page {
    width: 38rem;
    height: 25rem;
    border-radius: 0.3rem;
    box-shadow: 0 0.5rem 1.5rem rgba(0, 0.1, 0, 0.1);
    margin: 0 auto;
    padding: 0.5rem;
    text-align: center;
  }
  .login-btn {
    width: 50%;
    margin: 0 auto;
  }
  .dl_btn {
    width: 100%;
  }
  .link-container {
    margin: 0 auto;
    display: flex;
    justify-content: space-between; /* 两边对齐 */
    width: 50%; /* 确保容器宽度占满父元素 */
    margin-top: 1rem; /* 可选：添加上边距 */
  }
  .link-container p {
    font-size: 0.8rem;
    cursor: pointer; /* 鼠标悬停显示手型 */
    color: #409eff; /* 链接颜色 */
    margin: 0 0.5rem; /* 左右间距 */
  }
  .link-container p:hover {
    text-decoration: underline; /* 悬停下划线 */
  }
</style>
