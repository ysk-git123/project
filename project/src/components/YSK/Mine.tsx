import { useState, useEffect } from 'react';
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
import { calculateOrderStats, OrderStatus } from '../../utils/orderData';

interface UserInfo {
    id: string;
    username: string;
    image: string;
    phone: string;
    email: string;
    status: number;
    create_time: string;
    merchantCode?: string;
}

interface OrderStats {
    pending: number;
    processing: number;
    shipped: number;
    completed: number;
}

// 订单接口
interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    items: any[];
    totalAmount: number;
    status: string;
    createTime: string;
    paymentTime?: string;
    shippingTime?: string;
    deliveryTime?: string;
    address: any;
    paymentMethod: string;
    message?: string;
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

    // 映射后端状态到前端状态
    const mapBackendStatusToFrontend = (backendStatus: string): string => {
        switch (backendStatus) {
            case 'pending':
            case 'pending_payment':
                return OrderStatus.PENDING_PAYMENT;
            case 'processing':
            case 'paid':
            case 'success':
            case 'completed_payment':
                return OrderStatus.PAID;
            case 'shipped':
                return OrderStatus.SHIPPED;
            case 'received':
            case 'completed':
                return OrderStatus.RECEIVED;
            case 'cancelled':
                return OrderStatus.CANCELLED;
            case 'failed':
            case 'payment_failed':
                return OrderStatus.PAYMENT_FAILED;
            default:
                return OrderStatus.PENDING_PAYMENT;
        }
    };

    // 刷新订单统计数据
    const refreshOrderStats = async () => {
        if (!userInfo) return;

        setIsLoadingOrders(true);
        try {
            const username = userInfo.username || userInfo.id;

            // 获取订单列表而不是统计
            const response = await fetch(`http://localhost:3000/YJL/orders/${encodeURIComponent(username)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (response.ok) {
                const result = await response.json();

                if (result.code === 200 && result.data) {
                    // 转换后端数据格式为前端格式
                    const convertedOrders = result.data.map((order: any) => {
                        if (!order._id) {
                            console.error('订单缺少_id字段:', order);
                            return null;
                        }

                        // 状态映射
                        const mappedStatus = mapBackendStatusToFrontend(order.status);

                        return {
                            id: order._id,
                            orderNumber: order.orderNo,
                            userId: order.userId,
                            items: order.items || [],
                            totalAmount: order.totalAmount,
                            status: mappedStatus,
                            createTime: order.createdAt,
                            paymentTime: order.status === 'processing' || order.status === 'paid' ? order.updatedAt : undefined,
                            shippingTime: order.status === 'shipped' ? order.updatedAt : undefined,
                            deliveryTime: order.status === 'received' ? order.updatedAt : undefined,
                            address: order.address || {},
                            paymentMethod: order.paymentMethod || '支付宝',
                            message: order.message || ''
                        };
                    }).filter(Boolean);

                    // 使用前端统计计算函数
                    const stats = calculateOrderStats(convertedOrders);
                    setOrderStats(stats);
                } else {
                    console.warn('订单API返回错误:', result.message);
                }
            } else {
                console.warn('订单API请求失败，状态码:', response.status);
            }
        } catch (error) {
            console.error('获取订单数据失败:', error);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    // 监听订单数据更新事件
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'orderDataUpdated' && userInfo && !isLoadingOrders) {
                refreshOrderStats();
            }
        };

        // 监听localStorage变化
        window.addEventListener('storage', handleStorageChange);

        // 也监听自定义事件（同一页面内的更新）
        const handleCustomUpdate = () => {
            if (userInfo && !isLoadingOrders) {
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
                refreshOrderStats();
            }
        };

        const handleVisibilityChange = () => {
            // 当页面变为可见时，刷新订单数据
            if (document.visibilityState === 'visible' && userInfo && !isLoadingOrders) {
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
        if (userInfo) {
            refreshOrderStats();
        }
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
                            className={styles.orderMore}
                            onClick={() => navigate('/myorder')}
                            style={{ cursor: 'pointer' }}
                        >
                            <span>查看全部</span>
                            <RightOutline />
                        </div>
                    </div>
                </div>
                <div className={styles.orderStats}>
                    {menuItems.map((item, index) => (
                        <div
                            key={`order-${item.title}-${index}`}
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
            </Card>

            {/* 服务功能 */}
            <Card className={styles.serviceCard}>
                <div className={styles.serviceHeader}>
                    <span className={styles.serviceTitle}>服务功能</span>
                </div>
                <div className={styles.serviceGrid}>
                    {serviceItems.map((item, index) => (
                        <div
                            key={`service-${item.title}-${index}`}
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
                            key={`setting-${item.title}-${index}`}
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
