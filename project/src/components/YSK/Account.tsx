import React, { useState, useEffect } from "react";
import { 
    NavBar, 
    List, 
    Button, 
    Avatar, 
    Toast, 
    Card,
    Input,
    Dialog,
} from 'antd-mobile';
import { LeftOutline, UserOutline, PhonebookOutline, MailOutline, PictureOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { PUT } from '../../Axios/api';
import styles from './ModuleCSS/Mine.module.css';

interface UserInfo {
    id: string;
    username: string;
    image: string;
    phone: string;
    email: string;
    status: number;
    create_time: string;
}

interface FormData {
    username: string;
    phone: string;
    email: string;
    image: string;
}

export default function Account() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        username: '',
        phone: '',
        email: '',
        image: ''
    });
    const [editingField, setEditingField] = useState<string | null>(null);

    // 直接使用localStorage中的用户信息，实现无缝连接
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setUserInfo(user);
                setFormData({
                    username: user.username || '',
                    phone: user.phone || '',
                    email: user.email || '',
                    image: user.image || ''
                });
            } catch (error) {
                console.error('解析用户信息失败:', error);
                Toast.show('获取用户信息失败');
                navigate('/mine');
            }
        } else {
            // 如果没有用户信息，直接跳转到登录页
            navigate('/login');
        }
    }, [navigate]);

    const handleBack = () => {
        navigate('/mine');
    };

    const handleEditField = (field: string) => {
        setEditingField(field);
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        // 重置表单数据为原始数据
        if (userInfo) {
            setFormData({
                username: userInfo.username || '',
                phone: userInfo.phone || '',
                email: userInfo.email || '',
                image: userInfo.image || ''
            });
        }
    };

    const handleSaveField = async (field: string) => {
        if (!userInfo) return;

        const value = formData[field as keyof FormData];
        
        // 验证输入
        if (!value || value.trim() === '') {
            Toast.show('请输入内容');
            return;
        }

        // 特殊验证
        if (field === 'phone' && !/^1[3-9]\d{9}$/.test(value)) {
            Toast.show('请输入正确的手机号');
            return;
        }

        if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            Toast.show('请输入正确的邮箱地址');
            return;
        }

        setLoading(true);
        try {
            const updateData = { [field]: value.trim() };
            const response = await PUT('/YSK/user/profile', updateData);
            
            if (response.data.success) {
                const updatedUser = response.data.data;
                setUserInfo(updatedUser);
                setFormData(prev => ({
                    ...prev,
                    [field]: updatedUser[field as keyof UserInfo] || ''
                }));
                setEditingField(null);
                Toast.show('修改成功');
                
                // 更新localStorage中的用户信息
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
                Toast.show(response.data.message || '修改失败');
            }
        } catch (error: any) {
            console.error('修改用户信息失败:', error);
            Toast.show(error.response?.data?.message || '修改失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAll = async () => {
        if (!userInfo) return;

        // 验证所有字段
        const { username, phone, email } = formData;
        
        if (!username.trim()) {
            Toast.show('请输入用户名');
            return;
        }

        if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
            Toast.show('请输入正确的手机号');
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Toast.show('请输入正确的邮箱地址');
            return;
        }

        setLoading(true);
        try {
            const response = await PUT('/YSK/user/profile', {
                username: username.trim(),
                phone: phone.trim() || undefined,
                email: email.trim() || undefined,
                image: formData.image.trim() || undefined
            });
            
            if (response.data.success) {
                const updatedUser = response.data.data;
                setUserInfo(updatedUser);
                Toast.show('保存成功');
                navigate('/mine');
                
                // 更新localStorage中的用户信息
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
                Toast.show(response.data.message || '保存失败');
            }
        } catch (error: any) {
            console.error('保存用户信息失败:', error);
            Toast.show(error.response?.data?.message || '保存失败');
        } finally {
            setLoading(false);
        }
    };

    // 如果没有用户信息，不显示任何内容（避免闪烁）
    if (!userInfo) {
        return null;
    }

    return (
        <div className={styles.mineContainer}>
            {/* 顶部导航栏 */}
            <NavBar 
                onBack={handleBack}
                backArrow={<LeftOutline />}
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}
            >
                账户设置
            </NavBar>

            {/* 用户信息卡片 */}
            <Card className={styles.userCard} style={{ margin: '16px' }}>
                <div className={styles.userInfo}>
                    <Avatar
                        src={userInfo.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                        className={styles.avatar}
                    />
                    <div className={styles.userDetails}>
                        <div className={styles.userName}>{userInfo.username}</div>
                        <div className={styles.userPhone}>
                            {userInfo.phone ? userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未设置手机号'}
                        </div>
                        <div className={styles.userLevel}>
                            <span className={styles.points}>
                                注册时间: {new Date(userInfo.create_time).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* 设置选项 */}
            <Card className={styles.settingCard} style={{ margin: '16px' }}>
                <List>
                    <List.Item
                        prefix={<UserOutline />}
                        onClick={() => handleEditField('username')}
                        arrow
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span>用户名</span>
                            <span style={{ color: '#999', fontSize: '14px' }}>{userInfo.username}</span>
                        </div>
                    </List.Item>
                    <List.Item
                        prefix={<PhonebookOutline />}
                        onClick={() => handleEditField('phone')}
                        arrow
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span>手机号</span>
                            <span style={{ color: '#999', fontSize: '14px' }}>
                                {userInfo.phone ? userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未设置'}
                            </span>
                        </div>
                    </List.Item>
                    <List.Item
                        prefix={<MailOutline />}
                        onClick={() => handleEditField('email')}
                        arrow
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span>邮箱</span>
                            <span style={{ color: '#999', fontSize: '14px' }}>
                                {userInfo.email || '未设置'}
                            </span>
                        </div>
                    </List.Item>
                    <List.Item
                        prefix={<PictureOutline />}
                        onClick={() => handleEditField('image')}
                        arrow
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span>头像</span>
                            <span style={{ color: '#999', fontSize: '14px' }}>
                                {userInfo.image ? '已设置' : '未设置'}
                            </span>
                        </div>
                    </List.Item>
                </List>
            </Card>

            {/* 编辑对话框 */}
            {editingField && (
                <Dialog
                    visible={true}
                    title={`修改${editingField === 'username' ? '用户名' : 
                           editingField === 'phone' ? '手机号' : 
                           editingField === 'email' ? '邮箱' : '头像'}`}
                    content={
                        <div style={{ padding: '16px 0' }}>
                            <Input
                                placeholder={`请输入${editingField === 'username' ? '用户名' : 
                                           editingField === 'phone' ? '手机号' : 
                                           editingField === 'email' ? '邮箱' : '头像URL'}`}
                                value={formData[editingField as keyof FormData]}
                                onChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    [editingField]: value
                                }))}
                                style={{ marginBottom: '16px' }}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button
                                    block
                                    onClick={handleCancelEdit}
                                    style={{ flex: 1 }}
                                >
                                    取消
                                </Button>
                                <Button
                                    block
                                    color='primary'
                                    loading={loading}
                                    onClick={() => handleSaveField(editingField)}
                                    style={{ flex: 1 }}
                                >
                                    保存
                                </Button>
                            </div>
                        </div>
                    }
                    onClose={handleCancelEdit}
                />
            )}

            {/* 保存按钮 */}
            <div style={{ padding: '16px' }}>
                <Button
                    block
                    color='primary'
                    loading={loading}
                    onClick={handleSaveAll}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        height: '48px',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}
                >
                    保存修改
                </Button>
            </div>
        </div>
    );
}