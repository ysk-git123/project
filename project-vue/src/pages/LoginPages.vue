<template>
  <div class="login-container">
    <div class="login-page">
      <h3>欢迎登录!</h3>
      <div>输入框</div>
      <el-button type="primary" class="login-btn" @click="HandeLogin">登录</el-button>
      <div class="link-container">
        <p @click="HandeRegister">注册</p>
        <p @click="HandeForget">忘记密码</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  const router = useRouter();

  const HandeLogin = () => {
    router.push('/framework/home');
  };
  const HandeRegister = () => {
    router.push('/register');
  };
  const HandeForget = () => {
    router.push('/forget');
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
