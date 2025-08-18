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
          label-width="0"
          class="demo-ruleForm"
        >
          <el-form-item prop="username">
            <el-input
              v-model="ruleForm.username"
              placeholder="请输入用户名"
              autocomplete="off"
            />
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
            <el-button
              type="primary"
              class="dl_btn"
              @click="submitForm(ruleFormRef)"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="link-container">
        <p @click="HandeRegister">
          注册
        </p>
        <p @click="HandeForget">
          忘记密码
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
// @ts-expect-error 处理导入类型可能存在的兼容性问题
import type { ElFormItem, FormInstance, FormRules, FormRule } from 'element-plus';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { login, type LoginResponseData } from '../axios/api';
// 暂时不需要token管理，移除未使用的导入
// import { setAccessToken, setRefreshToken } from '../utils/tokenManager';
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
  username: [{ validator: validateUsername, trigger: 'change' }],
  pass: [{ validator: validatePass, trigger: 'change' }],
});

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  try {
    // 清除之前的验证状态
    formEl.clearValidate();
    await formEl.validate();
    console.log('📤 提交登录请求:', ruleForm.username);
    const res = await login({
      username: ruleForm.username,
      password: ruleForm.pass,
    });

    // 类型安全的响应数据处理
    const responseData: LoginResponseData = res.data;

    // 角色映射，确保与权限配置匹配
    const roleMapping: { [key: string]: string } = {
      '商家': 'merchant',
      '超级管理员': 'admin',
      '运营': 'operating',
      '统计': 'statistics',
      '财务': 'finance'
    };

    const mappedRole = roleMapping[responseData.role] || responseData.role;
    console.log('🔍 角色映射:', responseData.role, '→', mappedRole);

    // 存储token到本地存储
    if (responseData.accessToken) {
      localStorage.setItem('accessToken', responseData.accessToken);
      console.log('🔑 存储accessToken成功');
    } else {
      console.warn('⚠️ 响应中没有accessToken');
    }
    if (responseData.refreshToken) {
      localStorage.setItem('refreshToken', responseData.refreshToken);
      console.log('🔑 存储refreshToken成功');
    } else {
      console.warn('⚠️ 响应中没有refreshToken');
    }

    // 确保用户信息正确存储
    store.commit('login', {
      isLoggedIn: true,
      userInfo: {
        username: responseData.username,
        role: mappedRole,
        userId: responseData.userId,
        merchantCode: responseData.merchantCode,
      },
    });

    // 登录成功，一次性打印所有信息
    console.log('🎉 登录成功！用户信息如下：');
    console.log('👤 用户信息:', {
      username: responseData.username,
      role: responseData.role,
      userId: responseData.userId,
      merchantCode: responseData.merchantCode,
      accessToken: responseData.accessToken ? '已获取' : '未获取',
      refreshToken: responseData.refreshToken ? '已获取' : '未获取'
    });

    // 显示成功消息并跳转页面
    ElMessage.success({
      message: `登录成功！欢迎 ${responseData.username}`,
      duration: 2000
    });

    // 使用 router.replace 替换当前路由，避免回退到登录页
    setTimeout(() => {
      router.replace('/framework/home/SystemHomePage');
    }, 1000);
  } catch (error: unknown) {
    console.error('❌ 登录失败:', error);
    // 区分不同类型的错误
    let errorMessage = '登录失败，请检查用户名和密码';
    
    // 处理axios错误
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; statusText?: string; data?: { message?: string } }; request?: unknown };
      if (axiosError.response && axiosError.response.status === 403) {
        // 特别处理CSRF错误
        if (axiosError.response.data?.message?.includes('crumb')) {
          errorMessage = '登录失败: 安全验证失败，请刷新页面重试';
          // 可以添加自动刷新逻辑
          setTimeout(() => window.location.reload(), 2000);
        } else {
          errorMessage = '登录失败: 用户名或密码错误';
        }
      } else if (axiosError.response && axiosError.response.status === 404) {
        // 处理404错误
        errorMessage = '登录失败: 服务器未找到登录接口，请检查后端配置';
      } else if (axiosError.response) {
        errorMessage = `登录失败: ${axiosError.response.status} ${axiosError.response.statusText}`;
        if (axiosError.response.data && axiosError.response.data.message) {
          errorMessage += ` - ${axiosError.response.data.message}`;
        }
      } else if (axiosError.request) {
        errorMessage = '登录失败: 未收到服务器响应，请检查服务器是否运行';
      }
    } else if (error instanceof Error) {
      errorMessage = `登录失败: ${error.message}`;
    }
    
    ElMessage.error(errorMessage);
  }
};

// 组件挂载后初始化
onMounted(() => {
  // 延迟清除验证状态，避免初始化时的验证错误
  setTimeout(() => {
    if (ruleFormRef.value) {
      ruleFormRef.value.clearValidate();
    }
  }, 100);

  // 启动token监控（调试用）
  import('../utils/tokenManager').then(({ startTokenMonitoring }) => {
    startTokenMonitoring();
  });
});
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
  justify-content: space-between;
  /* 两边对齐 */
  width: 50%;
  /* 确保容器宽度占满父元素 */
  margin-top: 1rem;
  /* 可选：添加上边距 */
}

.link-container p {
  font-size: 0.8rem;
  cursor: pointer;
  /* 鼠标悬停显示手型 */
  color: #409eff;
  /* 链接颜色 */
  margin: 0 0.5rem;
  /* 左右间距 */
}

.link-container p:hover {
  text-decoration: underline;
  /* 悬停下划线 */
}
</style>
