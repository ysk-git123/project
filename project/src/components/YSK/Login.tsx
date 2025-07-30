import React, { useState } from 'react';
import { POST } from '../../Axios/api';
import '../YSK/Login.module..css'

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
            role: string;
        };
        token: string;
    };
}

export default function Login() {
    const [formData, setFormData] = useState<LoginForm>({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // 清除错误信息
        if (error) setError('');
    };

    // 表单验证
    const validateForm = (): boolean => {
        if (!formData.username.trim()) {
            setError('请输入用户名');
            return false;
        }
        if (!formData.password.trim()) {
            setError('请输入密码');
            return false;
        }
        if (formData.password.length < 6) {
            setError('密码长度至少6位');
            return false;
        }
        return true;
    };

    // 处理登录
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await POST('/auth/login', formData);
            const data: LoginResponse = response.data;

            if (data.success) {
                // 保存 token 和用户信息
                localStorage.setItem('token', data.data!.token);
                localStorage.setItem('user', JSON.stringify(data.data!.user));

                setSuccess('登录成功！正在跳转...');

                // 延迟跳转到首页
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                setError(data.message || '登录失败');
            }
        } catch (err: any) {
            console.error('登录错误:', err);
            setError(err.response?.data?.message || '网络错误，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h2>用户登录</h2>
                    <p>请输入您的账号和密码</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            {success}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username">用户名</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="请输入用户名"
                            disabled={loading}
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">密码</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="请输入密码"
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? '登录中...' : '登录'}
                    </button>
                </form>

                
            </div>
        </div>
    );
}
