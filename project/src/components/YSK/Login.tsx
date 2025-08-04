import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { POST } from '../../Axios/api';
import TokenManager from '../../utils/tokenManager';
import styles from './ModuleCSS/Login.module.css';

interface LoginForm {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      image: string;
      phone: string;
      status: number;
      create_time: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  // 处理登录
  const handleLogin = async (values: LoginForm) => {
    setLoading(true);

    try {
      const response = await POST('/YSK/login', values);
      const data: LoginResponse = response.data;

      if (data.success) {
        // 使用 TokenManager 保存 token 和用户信息
        TokenManager.setTokens(data.data!.accessToken, data.data!.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data!.user));
        console.log(data.data!.user);
        
        
        message.success('登录成功！正在跳转...');
        
        // 延迟跳转到首页
        setTimeout(() => {
          navigate('/shou');
        }, 1500);
      } else {
        message.error(data.message || '登录失败');
      }
    } catch (err: any) {
      console.error('登录错误:', err);
      message.error(err.response?.data?.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.loginHeader}>
          <h2>用户登录</h2>
          <p>请输入您的账号和密码</p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
          className={styles.loginForm}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 2, message: '用户名至少2个字符!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              disabled={loading}
              defaultValue="admin"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, message: '密码长度至少6位!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              disabled={loading}
              defaultValue="123456"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className={styles.loginButton}
              block
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
