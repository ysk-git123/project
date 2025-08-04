import React, { useState, useEffect } from 'react';
import {
    List,
    Avatar,
    Button,
    Card,
    Tag,
    Toast
} from 'antd-mobile';
import {
    UnorderedListOutline,
    PayCircleOutline,
    GiftOutline,
    SetOutline,
    RightOutline,
    LocationOutline,
    MessageOutline,
    HeartOutline,
    TruckOutline,
    SearchOutline
} from 'antd-mobile-icons';
import { Outlet, useLocation } from 'react-router-dom';
import styles from './ModuleCSS/Mine.module.css'
import TabBar from './TabBar';
import TokenManager from '../../utils/tokenManager';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
    id: string;
    username: string;
    image: string;
    phone: string;
    email: string;
    status: number;
    create_time: string;
}

interface OrderStats {
    pending: number;
    processing: number;
    shipped: number;
    completed: number;
}

export default function Mine() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [orderStats] = useState<OrderStats>({
        pending: 2,
        processing: 1,
        shipped: 3,
        completed: 15
    });

    // 检查是否在子路由中
    const isInSubRoute = location.pathname.includes('/mine/');

    // 获取用户信息
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setUserInfo(user);
            } catch (error) {
                console.error('解析用户信息失败:', error);
                // 如果解析失败，清除无效数据
                localStorage.removeItem('user');
                TokenManager.clearTokens();
                window.location.href = '/login';
            }
        } else {
            // 如果没有用户信息，跳转到登录页
            window.location.href = '/login';
        }
    }, []);

    // 处理退出登录
    const handleLogout = () => {
        TokenManager.clearTokens();
        Toast.show('退出登录成功');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
    };

    // 如果用户信息还未加载，显示加载状态
    if (!userInfo) {
        return (
            <div className={styles.mineContainer}>
                <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                    加载中...
                </div>
                <TabBar />
            </div>
        );
    }

    // 如果在子路由中，只渲染子路由内容
    if (isInSubRoute) {
        return <Outlet />;
    }

    const menuItems = [
        {
            title: '我的订单',
            icon: <UnorderedListOutline />,
            badge: orderStats.pending + orderStats.processing + orderStats.shipped,
            onClick: () => Toast.show('跳转到订单页面')
        },
        {
            title: '待付款',
            icon: <PayCircleOutline />,
            badge: orderStats.pending,
            onClick: () => Toast.show('跳转到待付款页面')
        },
        {
            title: '待发货',
            icon: <TruckOutline />,
            badge: orderStats.processing,
            onClick: () => Toast.show('跳转到待发货页面')
        },
        {
            title: '待收货',
            icon: <GiftOutline />,
            badge: orderStats.shipped,
            onClick: () => Toast.show('跳转到待收货页面')
        }
    ];

    const serviceItems = [
        {
            title: '收货地址',
            icon: <LocationOutline />,
        },
        {
            title: '我的收藏',
            icon: <HeartOutline />,
        },
        {
            title: '客服中心',
            icon: <SearchOutline />,
        },
        {
            title: '意见反馈',
            icon: <MessageOutline />,
        }
    ];

    const settingItems = [
        {
            title: '账户设置',
            icon: <SetOutline />,
            onClick: () => navigate('/mine/account')
        },
        {
            title: '隐私设置',
            icon: <SetOutline />,
        }
    ];

    return (
        <div className={styles.mineContainer}>
            {/* 用户信息卡片 */}
            <Card className={styles.userCard}>
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
                            <Tag color='primary'>
                                {userInfo.status === 1 ? 'VIP会员' : '普通用户'}
                            </Tag>
                            <span className={styles.points}>
                                注册时间: {new Date(userInfo.create_time).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <Button
                        size='small'
                        className={styles.editBtn}
                        onClick={() => {
                            Toast.show('编辑个人信息');
                        }}
                    >
                        编辑
                    </Button>
                </div>
            </Card>

            {/* 订单统计 */}
            <Card className={styles.orderCard}>
                <div className={styles.orderHeader}>
                    <span className={styles.orderTitle}>我的订单</span>
                    <div className={styles.orderMore}>
                        <span>查看全部</span>
                        <RightOutline />
                    </div>
                </div>
                <div className={styles.orderStats}>
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            className={styles.orderItem}
                            onClick={item.onClick}
                        >
                            <div className={styles.orderIcon}>
                                {item.icon}
                                {item.badge > 0 && (
                                    <span className={styles.badge}>{item.badge}</span>
                                )}
                            </div>
                            <span className={styles.orderText}>{item.title}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* 服务功能 */}
            <Card className={styles.serviceCard}>
                <div className={styles.serviceHeader}>
                    <span className={styles.serviceTitle}>服务功能</span>
                </div>
                <div className={styles.serviceGrid}>
                    {serviceItems.map((item, index) => (
                        <div
                            key={index}
                            className={styles.serviceItem}
                        >
                            <div className={styles.serviceIcon}>{item.icon}</div>
                            <span className={styles.serviceText}>{item.title}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* 设置选项 */}
            <Card className={styles.settingCard}>
                <List>
                    {settingItems.map((item, index) => (
                        <List.Item
                            key={index}
                            prefix={item.icon}
                            onClick={item.onClick}
                            arrow={<RightOutline />}
                        >
                            {item.title}
                        </List.Item>
                    ))}
                </List>
            </Card>

            {/* 退出登录 */}
            <div className={styles.logoutContainer}>
                <Button
                    block
                    color='danger'
                    className={styles.logoutBtn}
                    onClick={handleLogout}
                >
                    退出登录
                </Button>
            </div>
            <TabBar />
        </div>
    );
}
