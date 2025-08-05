import  { useState, useEffect } from 'react';
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
import { Outlet } from 'react-router-dom';
import styles from './ModuleCSS/Mine.module.css'
import TabBar from './TabBar';
import TokenManager from '../../utils/tokenManager';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMockOrders, calculateOrderStats } from '../../utils/orderData';

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
    const [orderStats, setOrderStats] = useState<OrderStats>({
        pending: 0,
        processing: 0,
        shipped: 0,
        completed: 0
    });
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

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

    // 刷新订单统计数据
    const refreshOrderStats = async () => {
        if (!userInfo) return;

        setIsLoadingOrders(true);
        try {
            // 首先尝试从API获取真实订单数据
            const username = userInfo.username || userInfo.name || userInfo.id;
            const response = await fetch(`http://localhost:3000/YJL/orders/${encodeURIComponent(username)}`);
            
            if (response.ok) {
                const result = await response.json();
                if (result.code === 200 && result.data) {
                    // 使用真实API数据计算统计
                    const realStats = calculateOrderStats(result.data);
                    setOrderStats(realStats);
                    console.log('刷新真实订单数据:', realStats);
                    return;
                }
            }
        } catch (error) {
            console.warn('刷新真实订单数据失败，使用模拟数据:', error);
        }

        // 如果API失败，回退到模拟数据
        const mockOrders = getMockOrders();
        const stats = calculateOrderStats(mockOrders);
        setOrderStats(stats);
        console.log('刷新模拟订单数据:', stats);
    };

    // 监听订单数据更新事件
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'orderDataUpdated' && userInfo && !isLoadingOrders) {
                console.log('检测到订单数据更新，刷新统计');
                refreshOrderStats();
            }
        };

        // 监听localStorage变化
        window.addEventListener('storage', handleStorageChange);

        // 也监听自定义事件（同一页面内的更新）
        const handleCustomUpdate = () => {
            if (userInfo && !isLoadingOrders) {
                console.log('检测到同页面订单数据更新，刷新统计');
                refreshOrderStats();
            }
        };

        window.addEventListener('orderDataUpdated', handleCustomUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('orderDataUpdated', handleCustomUpdate);
        };
    }, [userInfo, isLoadingOrders]);

    // 页面聚焦时刷新订单数据
    useEffect(() => {
        const handleFocus = () => {
            // 当页面重新获得焦点时，刷新订单数据
            if (userInfo && !isLoadingOrders) {
                console.log('页面获得焦点，刷新订单数据');
                refreshOrderStats();
            }
        };

        // 监听页面可见性变化
        const handleVisibilityChange = () => {
            if (!document.hidden && userInfo && !isLoadingOrders) {
                console.log('页面变为可见，刷新订单数据');
                refreshOrderStats();
            }
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [userInfo, isLoadingOrders]);

    // 获取订单统计
    useEffect(() => {
        const fetchOrderStats = async () => {
            if (!userInfo) return;

            setIsLoadingOrders(true);
            try {
                // 首先尝试从API获取真实订单数据
                const username = userInfo.username || userInfo.name || userInfo.id;
                const response = await fetch(`http://localhost:3000/YJL/orders/${encodeURIComponent(username)}`);
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.code === 200 && result.data) {
                        // 使用真实API数据计算统计
                        const realStats = calculateOrderStats(result.data);
                        setOrderStats(realStats);
                        console.log('使用真实订单数据:', realStats);
                        setIsLoadingOrders(false);
                        return;
                    }
                }
            } catch (error) {
                console.warn('获取真实订单数据失败，使用模拟数据:', error);
            }

            // 如果API失败，回退到模拟数据
            const mockOrders = getMockOrders();
            const stats = calculateOrderStats(mockOrders);
            setOrderStats(stats);
            console.log('使用模拟订单数据:', stats);
            setIsLoadingOrders(false);
        };

        fetchOrderStats();
    }, [userInfo]); // 依赖userInfo，当用户信息变化时重新获取

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
            badge: orderStats.pending + orderStats.processing + orderStats.shipped + orderStats.completed,
            onClick: () => navigate('/myorder')
        },
        {
            title: '待付款',
            icon: <PayCircleOutline />,
            badge: orderStats.pending,
            onClick: () => navigate('/myorder', { state: { activeTab: 'pending_payment' } })
        },
        {
            title: '待发货',
            icon: <TruckOutline />,
            badge: orderStats.processing,
            onClick: () => navigate('/myorder', { state: { activeTab: 'paid' } })
        },
        {
            title: '待收货',
            icon: <GiftOutline />,
            badge: orderStats.shipped,
            onClick: () => navigate('/myorder', { state: { activeTab: 'shipped' } })
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
                    <div className={styles.orderActions}>
                        <div 
                            className={styles.refreshBtn}
                            onClick={() => {
                                refreshOrderStats();
                                setIsLoadingOrders(false);
                            }}
                            style={{ 
                                cursor: 'pointer', 
                                marginRight: '12px',
                                color: isLoadingOrders ? '#ccc' : '#007AFF',
                                transition: 'color 0.3s'
                            }}
                        >
                            {isLoadingOrders ? '刷新中...' : '🔄'}
                        </div>
                        <div 
                            className={styles.orderMore}
                            onClick={() => navigate('/myorder')}
                            style={{ cursor: 'pointer' }}
                        >
                            <span>查看全部</span>
                            <RightOutline />
                        </div>
                    </div>
                </div>
                {isLoadingOrders ? (
                    <div className={styles.orderLoading}>
                        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                            ⏳ 加载订单数据中...
                        </div>
                    </div>
                ) : (
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
                                        <span className={styles.badge}>
                                            {item.badge > 99 ? '99+' : item.badge}
                                        </span>
                                    )}
                                </div>
                                <span className={styles.orderText}>{item.title}</span>
                            </div>
                        ))}
                    </div>
                )}
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
