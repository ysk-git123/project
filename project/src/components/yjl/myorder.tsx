import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser } from '../../utils/auth';
import { calculateOrderStats, OrderStatus } from '../../utils/orderData';
import type { Order, OrderStatusType } from '../../utils/orderData';
import './modules.css/myorder.moudle.css';

// 用户信息接口
interface UserInfo {
    id: string;
    username: string;
    name?: string;
    image?: string;
    phone?: string;
    email?: string;
}

// 订单统计接口
interface OrderStats {
    pending: number;
    processing: number;
    shipped: number;
    completed: number;
}

const MyOrder: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 从路由状态获取激活的标签页
    const initialTab = location.state?.activeTab || 'all';

    const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<string>(initialTab);
    const [orderStats, setOrderStats] = useState<OrderStats>({
        pending: 0,
        processing: 0,
        shipped: 0,
        completed: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [countdowns, setCountdowns] = useState<{ [key: string]: number }>({}); // 倒计时状态

    // 获取当前登录用户
    useEffect(() => {
        const user = getUser();
        setCurrentUser(user);
    }, []);

    // 获取订单数据
    const fetchOrders = async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            // 从API获取真实订单数据
            if (currentUser) {
                const response = await fetch(`/YJL/orders/${currentUser.username}`, {
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
                        }).filter(Boolean); // 过滤掉null值

                        setOrders(convertedOrders);
                        const stats = calculateOrderStats(convertedOrders);
                        setOrderStats(stats);
                        
                        // 为所有待发货订单启动自动发货定时器
                        convertedOrders.forEach((order: Order) => {
                            if (order.status === OrderStatus.PAID) {
                                startAutoShipTimer(order);
                            }
                        });
                        
                        return;
                    }
                }
            }

            // 如果API失败，使用空数据
            setOrders([]);
            setOrderStats({
                pending: 0,
                processing: 0,
                shipped: 0,
                completed: 0
            });

        } catch (error) {
            console.error('获取订单失败:', error);
            setOrders([]);
            setOrderStats({
                pending: 0,
                processing: 0,
                shipped: 0,
                completed: 0
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // 映射后端状态到前端状态
    const mapBackendStatusToFrontend = (backendStatus: string): OrderStatusType => {
        const mappedStatus = (() => {
            switch (backendStatus) {
                case 'pending':
                case 'pending_payment':
                    return OrderStatus.PENDING_PAYMENT;
                case 'processing':
                case 'paid':
                case 'success':  // 支付成功状态
                case 'completed_payment':  // 支付完成状态
                    return OrderStatus.PAID;  // ✅ 支付成功后显示为待发货
                case 'shipped':
                    return OrderStatus.SHIPPED; // 已发货但未收货
                case 'received':
                case 'completed':
                    return OrderStatus.RECEIVED; // 已收货

                case 'cancelled':
                    return OrderStatus.CANCELLED;
                case 'failed':
                case 'payment_failed':
                    return OrderStatus.PAYMENT_FAILED;
                default:
                    return OrderStatus.PENDING_PAYMENT;
            }
        })();
        
        return mappedStatus;
    };

    // 自动发货定时器管理
    const autoShipTimers = useRef<Map<string, number>>(new Map());
    
    // 启动自动发货定时器
    const startAutoShipTimer = (order: Order) => {
        // 如果订单状态是待发货，启动1分钟定时器
        if (order.status === OrderStatus.PAID) {
            const orderNumber = order.orderNumber;
            
            // 清除已存在的定时器
            if (autoShipTimers.current.has(orderNumber)) {
                clearTimeout(autoShipTimers.current.get(orderNumber)!);
            }
            
            // 启动倒计时更新定时器
            const countdownTimer = setInterval(() => {
                setCountdowns(prev => {
                    const currentCountdown = prev[orderNumber] || 60;
                    if (currentCountdown <= 1) {
                        clearInterval(countdownTimer);
                        return { ...prev, [orderNumber]: 0 };
                    }
                    return { ...prev, [orderNumber]: currentCountdown - 1 };
                });
            }, 1000);
            
            // 启动自动发货定时器
            const timer = setTimeout(async () => {
                try {
                    console.log(`订单 ${orderNumber} 自动发货倒计时结束，开始自动发货`);
                    
                    // 调用自动发货API
                    const response = await fetch(`/YJL/order/auto-ship/${orderNumber}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        if (result.code === 200) {
                            console.log(`订单 ${orderNumber} 自动发货成功`);
                            // 刷新订单数据
                            fetchOrders(false);
                        } else {
                            console.error(`订单 ${orderNumber} 自动发货失败:`, result.message);
                        }
                    } else {
                        console.error(`订单 ${orderNumber} 自动发货API调用失败`);
                    }
                } catch (error) {
                    console.error(`订单 ${orderNumber} 自动发货异常:`, error);
                } finally {
                    // 清除定时器引用
                    autoShipTimers.current.delete(orderNumber);
                    clearInterval(countdownTimer);
                }
            }, 60000); // 1分钟 = 60000毫秒
            
            // 保存定时器引用
            autoShipTimers.current.set(orderNumber, timer);
            console.log(`订单 ${orderNumber} 自动发货定时器已启动，1分钟后自动发货`);
        }
    };
    
    // 清理自动发货定时器
    const clearAutoShipTimer = (orderNumber: string) => {
        if (autoShipTimers.current.has(orderNumber)) {
            clearTimeout(autoShipTimers.current.get(orderNumber)!);
            autoShipTimers.current.delete(orderNumber);
            setCountdowns(prev => {
                const newCountdowns = { ...prev };
                delete newCountdowns[orderNumber];
                return newCountdowns;
            });
            console.log(`订单 ${orderNumber} 自动发货定时器已清理`);
        }
    };
    
    // 页面加载时获取订单
    useEffect(() => {
        if (currentUser) {
            fetchOrders();
        }
        
        // 页面卸载时清理所有定时器
        return () => {
            autoShipTimers.current.forEach((timerId) => {
                clearTimeout(timerId);
            });
            autoShipTimers.current.clear();
            console.log('所有自动发货定时器已清理');
        };
    }, [currentUser]);





    // 定期刷新订单状态（每30秒检查一次）
    // 临时关闭自动刷新功能，防止无限循环
    // useEffect(() => {
    //     if (!currentUser) return;
    //     // ... 自动刷新逻辑已注释
    // }, [currentUser]);

    // 监听路由状态变化，更新激活的标签页
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state?.activeTab]);



    // 过滤订单
    const getFilteredOrders = (): Order[] => {
        switch (activeTab) {
            case 'pending_payment':
                return orders.filter(order => order.status === OrderStatus.PENDING_PAYMENT);
            case 'paid':
                return orders.filter(order => order.status === OrderStatus.PAID); // 待发货标签页只显示已付款订单
            case 'shipped':
                return orders.filter(order => order.status === OrderStatus.SHIPPED); // 已发货标签页只显示已发货订单
            case 'received':
                return orders.filter(order => order.status === OrderStatus.RECEIVED); // 已收货标签页只显示已收货订单

            default:
                return orders; // 全部标签页显示所有订单
        }
    };

    // 获取状态显示文本
    const getStatusText = (status: OrderStatusType): string => {
        switch (status) {
            case OrderStatus.PENDING_PAYMENT:
                return '待付款';
            case OrderStatus.PAID:
                return '已付款';
            case OrderStatus.SHIPPED:
                return '已发货';
            case OrderStatus.RECEIVED:
                return '已收货';

            case OrderStatus.CANCELLED:
                return '已取消';
            case OrderStatus.PAYMENT_FAILED:
                return '支付失败';
            default:
                return '未知状态';
        }
    };

    // 获取状态样式类
    const getStatusClass = (status: OrderStatusType): string => {
        switch (status) {
            case OrderStatus.PENDING_PAYMENT:
                return 'status-pending';
            case OrderStatus.PAID:
                return 'status-paid';
            case OrderStatus.SHIPPED:
                return 'status-shipped';
            case OrderStatus.RECEIVED:
                return 'status-received';

            case OrderStatus.CANCELLED:
                return 'status-cancelled';
            case OrderStatus.PAYMENT_FAILED:
                return 'status-failed';
            default:
                return 'status-unknown';
        }
    };

    // 处理重新支付
    const handleRepayment = async (order: Order) => {
        try {
            // 检查用户是否已登录
            if (!currentUser) {
                alert('请先登录后再进行支付');
                navigate('/login');
                return;
            }



            // 构建支付URL
            const username = currentUser.username || currentUser.name || `用户_${currentUser.id}`;
            const amount = order.totalAmount.toFixed(2);
            const payUrl = `/YJL/zf?username=${encodeURIComponent(username)}&amount=${amount}&orderNo=${order.orderNumber}`;

            // 调用支付API
            const response = await fetch(payUrl);
            const result = await response.json();

            if (result.code === 200 && result.data) {
                // 在新窗口打开支付页面
                const payWindow = window.open(result.data.payUrl, '_blank', 'width=800,height=600');

                // 监听支付完成
                const checkPaymentStatus = async () => {
                    if (payWindow?.closed) {
                        // 支付窗口关闭，检查支付状态
                        try {
                            const statusResponse = await fetch(`/YJL/order/status/${result.data.orderNo}`);
                            if (statusResponse.ok) {
                                const statusResult = await statusResponse.json();
                                if (statusResult.code === 200) {
                                    if (statusResult.data.status === 'success') {
                                        // 刷新订单数据
                                        fetchOrders(false);

                                        // 触发订单数据更新事件
                                        localStorage.setItem('orderDataUpdated', Date.now().toString());
                                        window.dispatchEvent(new CustomEvent('orderDataUpdated'));
                                        return;
                                    }
                                }
                            }
                        } catch (error) {
                            console.error('检查支付状态失败:', error);
                        }

                        // 默认处理：支付窗口关闭，可能支付完成
                        alert('支付窗口已关闭！如果已完成支付，订单状态将在几分钟内更新。');

                        // 刷新订单数据
                        fetchOrders(false);
                    } else {
                        // 继续检查支付状态
                        setTimeout(checkPaymentStatus, 1000);
                    }
                };

                // 开始检查支付状态
                setTimeout(checkPaymentStatus, 1000);

            } else {
                alert(`重新支付失败: ${result.message || '未知错误'}`);
            }
        } catch (error) {
            console.error('重新支付失败:', error);
            alert('重新支付失败，请重试');
        }
    };

    // 处理订单操作
    const handleOrderAction = async (orderId: string, action: string) => {
        // 验证orderId
        if (!orderId || orderId === 'undefined') {
            console.error('订单ID无效:', orderId);
            alert('订单ID无效，请刷新页面重试');
            return;
        }

        try {
            switch (action) {
                case 'pay':
                    // 直接调用支付API，重新发起支付
                    const orderToPay = orders.find(order => order.id === orderId);
                    if (orderToPay) {
                        await handleRepayment(orderToPay);
                    }
                    break;
                case 'cancel':
                    if (confirm('确定要取消这个订单吗？')) {
                        // 找到对应的订单，获取正确的订单号
                        const orderToCancel = orders.find(order => order.id === orderId);
                        if (!orderToCancel) {
                            console.error('找不到要取消的订单:', orderId);
                            alert('订单信息错误，请刷新页面重试');
                            return;
                        }
                        
                        // 尝试调用API取消订单
                        try {
                            const response = await fetch(`/YJL/order/cancel/${orderToCancel.id}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                                }
                            });
                            
                            if (response.ok) {
                                const result = await response.json();
                                if (result.code === 200) {
                                    // 订单取消成功，静默处理
                                    fetchOrders(false);
                                    // 触发订单数据更新事件
                                    localStorage.setItem('orderDataUpdated', Date.now().toString());
                                    window.dispatchEvent(new CustomEvent('orderDataUpdated'));
                                    return;
                                } else {
                                    alert(`取消订单失败: ${result.message}`);
                                    return;
                                }
                            } else {
                                const errorResult = await response.json();
                                console.error('取消订单API错误:', errorResult);
                                alert(`取消订单失败: ${errorResult.message || response.status}`);
                                return;
                            }
                        } catch (error) {
                            console.error('API取消订单失败:', error);
                            alert('网络错误，请重试');
                            return;
                        }
                    }
                    break;
                case 'confirm':
                    if (confirm('确认收货吗？')) {
                        // 找到对应的订单
                        const orderToConfirm = orders.find(order => order.id === orderId);
                        if (!orderToConfirm) {
                            console.error('找不到要确认收货的订单:', orderId);
                            alert('订单信息错误，请刷新页面重试');
                            return;
                        }
                        
                        // 检查订单状态是否正确
                        if (orderToConfirm.status !== OrderStatus.SHIPPED) {
                            alert(`订单状态不正确，当前状态: ${getStatusText(orderToConfirm.status)}，只有已发货的订单才能确认收货。`);
                            return;
                        }
                        
                        // 尝试调用API确认收货
                        try {
                            const response = await fetch(`/YJL/order/confirm/${orderId}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                                }
                            });
                            
                            if (response.ok) {
                                const result = await response.json();
                                if (result.code === 200) {
                                    // 确认收货成功，静默处理
                                    // 刷新订单数据
                                    fetchOrders(false);
                                    // 触发订单数据更新事件
                                    localStorage.setItem('orderDataUpdated', Date.now().toString());
                                    window.dispatchEvent(new CustomEvent('orderDataUpdated'));
                                    return;
                                } else {
                                    alert(`确认收货失败: ${result.message}`);
                                    return;
                                }
                            } else {
                                const errorResult = await response.json();
                                console.error('确认收货API错误:', errorResult);
                                alert(`确认收货失败: ${errorResult.message || response.status}`);
                                return;
                            }
                        } catch (error) {
                            console.error('API确认收货失败:', error);
                            alert('网络错误，请重试');
                            return;
                        }
                    }
                    break;
                case 'view':
                    // 查看订单详情
                    navigate(`/order-detail/${orderId}`);
                    break;
                case 'rebuy':
                    // 再次购买逻辑
                    const orderToRebuy = orders.find(order => order.id === orderId);
                    if (orderToRebuy) {
                        // 将商品添加到购物车
                        try {
                            // 这里可以调用购物车API，暂时使用本地存储模拟
                            const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
                            orderToRebuy.items.forEach(item => {
                                const existingItem = cartItems.find((cartItem: any) => 
                                    cartItem.id === item.id && 
                                    cartItem.color === item.color && 
                                    cartItem.size === item.size
                                );
                                
                                if (existingItem) {
                                    existingItem.quantity += item.quantity;
                                } else {
                                    cartItems.push({
                                        ...item,
                                        selected: true
                                    });
                                }
                            });
                            
                            localStorage.setItem('cartItems', JSON.stringify(cartItems));
                            alert('商品已添加到购物车！');
                            
                            // 跳转到购物车页面
                            navigate('/cart');
                        } catch (error) {
                            console.error('添加到购物车失败:', error);
                            alert('添加到购物车失败，请重试');
                        }
                    }
                    break;
                case 'review':
                    // 评价订单逻辑
                    alert('评价功能开发中，敬请期待！');
                    break;
                case 'urge':
                    // 催发货逻辑
                    alert('催发货请求已发送，商家会尽快处理！');
                    break;
                case 'delete':
                    if (confirm('确定要删除这个订单吗？删除后无法恢复。')) {
                        // 尝试调用API删除订单
                        try {
                            const response = await fetch(`/YJL/order/delete/${orderId}`, {
                                method: 'DELETE'
                            });
                            if (response.ok) {
                                const result = await response.json();
                                if (result.code === 200) {
                                    // 从本地订单列表中移除
                                    setOrders(prevOrders =>
                                        prevOrders.filter(order => order.id !== orderId)
                                    );
                                    // 触发订单数据更新事件
                                    localStorage.setItem('orderDataUpdated', Date.now().toString());
                                    window.dispatchEvent(new CustomEvent('orderDataUpdated'));
                                    // 订单删除成功，静默处理
                                    return;
                                } else {
                                    alert(`删除失败: ${result.message}`);
                                }
                            } else {
                                const errorResult = await response.json();
                                alert(`删除失败: ${errorResult.message || response.status}`);
                            }
                        } catch (error) {
                            console.warn('API删除订单失败:', error);
                            alert('删除失败，请重试');
                        }
                    }
                    break;

                default:
                    console.warn('未知操作:', action);
            }
        } catch (error) {
            console.error('订单操作失败:', error);
            alert('操作失败，请重试');
        }
    };

    // 获取订单计数（包含徽章数字）
    const getOrderCounts = () => {
        const counts = {
            all: orders.length,
            pending: orders.filter(order => order.status === OrderStatus.PENDING_PAYMENT).length,
            paid: orders.filter(order => order.status === OrderStatus.PAID).length, // 待发货标签页计数
            shipped: orders.filter(order => order.status === OrderStatus.SHIPPED).length, // 已发货标签页计数
            received: orders.filter(order => order.status === OrderStatus.RECEIVED).length, // 已收货标签页计数

        };
        
        // 关闭调试日志，防止无限循环
        // console.log('订单计数:', counts);
        // console.log('订单状态详情:', orders.map(order => ({
        //     id: order.id,
        //     orderNumber: order.orderNumber,
        //     status: order.status,
        //     createTime: order.createTime
        // })));
        
        return counts;
    };

    const orderCounts = getOrderCounts();

    // 如果没有登录用户，显示登录提示
    if (!currentUser) {
        return (
            <div className="order-container">
                <div className="order-header">
                    <div className="header-btn" onClick={() => navigate(-1)}>返回</div>
                    <span className="header-title">我的订单</span>
                    <div className="header-btn"></div>
                </div>
                <div className="login-prompt">
                    <div className="login-icon">🔐</div>
                    <p>请先登录查看订单</p>
                    <button
                        className="login-btn"
                        onClick={() => navigate('/login')}
                    >
                        去登录
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="order-container">
            {/* 头部 */}
            <div className="order-header">
                <div className="header-btn" onClick={() => navigate('/mine')}>返回</div>
                <span className="header-title">我的订单</span>
                <div className="header-btn" onClick={() => {
                    fetchOrders(false);
                }}>
                    {refreshing ? '刷新中...' : '刷新'}
                </div>
            </div>
            


            {/* 订单状态标签页 */}
            <div className="order-tabs">
                <div
                    key="all"
                    className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    <div className="tab-content">
                        <span className="tab-text">全部</span>
                        {orderCounts.all > 0 && (
                            <span className="tab-badge" data-count={orderCounts.all > 99 ? "99+" : orderCounts.all.toString()}>
                                {orderCounts.all > 99 ? "99+" : orderCounts.all}
                            </span>
                        )}
                    </div>
                </div>
                <div
                    key="pending_payment"
                    className={`tab-item ${activeTab === 'pending_payment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending_payment')}
                >
                    <div className="tab-content">
                        <span className="tab-text">待付款</span>
                        {orderCounts.pending > 0 && (
                            <span className="tab-badge" data-count={orderCounts.pending > 99 ? "99+" : orderCounts.pending.toString()}>
                                {orderCounts.pending > 99 ? "99+" : orderCounts.pending}
                            </span>
                        )}
                    </div>
                </div>
                <div
                    key="paid"
                    className={`tab-item ${activeTab === 'paid' ? 'active' : ''}`}
                    onClick={() => setActiveTab('paid')}
                >
                    <div className="tab-content">
                        <span className="tab-text">待发货</span>
                        {orderCounts.paid > 0 && (
                            <span className="tab-badge" data-count={orderCounts.paid > 99 ? "99+" : orderCounts.paid.toString()}>
                                {orderCounts.paid > 99 ? "99+" : orderCounts.paid}
                            </span>
                        )}
                    </div>
                </div>
                <div
                    key="shipped"
                    className={`tab-item ${activeTab === 'shipped' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shipped')}
                >
                    <div className="tab-content">
                        <span className="tab-text">已发货</span>
                        {orderCounts.shipped > 0 && (
                            <span className="tab-badge" data-count={orderCounts.shipped > 99 ? "99+" : orderCounts.shipped.toString()}>
                                {orderCounts.shipped > 99 ? "99+" : orderCounts.shipped}
                            </span>
                        )}
                    </div>
                </div>
                <div
                    key="received"
                    className={`tab-item ${activeTab === 'received' ? 'active' : ''}`}
                    onClick={() => setActiveTab('received')}
                >
                    <div className="tab-content">
                        <span className="tab-text">已收货</span>
                        {orderCounts.received > 0 && (
                            <span className="tab-badge" data-count={orderCounts.received > 99 ? "99+" : orderCounts.received.toString()}>
                                {orderCounts.received > 99 ? "99+" : orderCounts.received}
                            </span>
                        )}
                    </div>
                </div>

            </div>

            {/* 订单列表 */}
            <div className="order-list">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner">⏳</div>
                        <p>加载订单中...</p>
                    </div>
                ) : (
                    <>
                        {getFilteredOrders().length > 0 ? (
                            getFilteredOrders().map((order) => (
                                <div key={order.id} className="order-item">

                                    
                                    {/* 订单头部 */}
                                    <div className="order-item-header">
                                        <div className="order-number">订单号: {order.orderNumber}</div>
                                    </div>

                                    {/* 商品列表 */}
                                    <div className="order-products">
                                        {order.items.map((item, index) => (
                                            <div key={`${order.id}-${item.id || index}`} className="product-item">
                                                <div className="product-image">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/img/1.jpg';
                                                        }}
                                                    />
                                                </div>
                                                <div className="product-info">
                                                    <div className="product-name">{item.name}</div>
                                                    <div className="product-specs">
                                                        {item.color} {item.size} x{item.quantity}
                                                    </div>
                                                    <div className="product-price">¥{item.price}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 订单信息 */}
                                    <div className="order-info">
                                        <div className="order-time">下单时间: {order.createTime}</div>
                                        <div className="order-total">共{order.items.length}件商品 总计: ¥{order.totalAmount.toFixed(2)}</div>
                                    </div>

                                    {/* 操作按钮 */}
                                    <div className="order-actions">
                                        {/* 查看详情按钮 - 所有状态都显示 */}
                                        <button
                                            className="action-btn secondary view-details-btn"
                                            onClick={() => handleOrderAction(order.id, 'view')}
                                        >
                                            查看详情
                                        </button>

                                        {/* 待付款状态：显示取消订单和立即支付 */}
                                        {order.status === OrderStatus.PENDING_PAYMENT && (
                                            <>
                                                <button
                                                    className="action-btn secondary"
                                                    onClick={() => handleOrderAction(order.id, 'cancel')}
                                                >
                                                    取消订单
                                                </button>
                                                <button
                                                    className="action-btn primary"
                                                    onClick={() => handleOrderAction(order.id, 'pay')}
                                                >
                                                    立即支付
                                                </button>
                                            </>
                                        )}

                                        {/* 待发货状态：显示取消订单、催发货和倒计时 */}
                                        {order.status === OrderStatus.PAID && (
                                            <>
                                                <button
                                                    className="action-btn secondary"
                                                    onClick={() => handleOrderAction(order.id, 'cancel')}
                                                >
                                                    取消订单
                                                </button>
                                                <button
                                                    className="action-btn secondary"
                                                    onClick={() => handleOrderAction(order.id, 'urge')}
                                                >
                                                    催发货
                                                </button>
                                                {/* 倒计时显示 */}
                                                {/* {countdowns[order.orderNumber] > 0 && (
                                                    <div className="countdown-display">
                                                        <span className="countdown-label">自动发货倒计时:</span>
                                                        <span className="countdown-time">{countdowns[order.orderNumber]}秒</span>
                                                    </div>
                                                )} */}
                                            </>
                                        )}

                                        {/* 已发货状态：显示确认收货和再次购买 */}
                                        {order.status === OrderStatus.SHIPPED && (
                                            <>
                                                <button
                                                    className="action-btn primary"
                                                    onClick={() => handleOrderAction(order.id, 'confirm')}
                                                >
                                                    确认收货
                                                </button>
                                                <button
                                                    className="action-btn secondary"
                                                    onClick={() => handleOrderAction(order.id, 'rebuy')}
                                                >
                                                    再次购买
                                                </button>
                                            </>
                                        )}

                                        {/* 已收货状态：显示再次购买和评价 */}
                                        {order.status === OrderStatus.RECEIVED && (
                                            <>
                                                <button
                                                    className="action-btn primary"
                                                    onClick={() => handleOrderAction(order.id, 'rebuy')}
                                                >
                                                    再次购买
                                                </button>
                                                <button
                                                    className="action-btn secondary"
                                                    onClick={() => handleOrderAction(order.id, 'review')}
                                                >
                                                    评价订单
                                                </button>
                                            </>
                                        )}

                                        {/* 已取消状态：显示删除订单 */}
                                        {order.status === OrderStatus.CANCELLED && (
                                            <button
                                                className="action-btn danger"
                                                onClick={() => handleOrderAction(order.id, 'delete')}
                                            >
                                                删除订单
                                            </button>
                                        )}

                                        {/* 支付失败状态：显示重新支付和取消订单 */}
                                        {order.status === OrderStatus.PAYMENT_FAILED && (
                                            <>
                                                <button
                                                    className="action-btn secondary"
                                                    onClick={() => handleOrderAction(order.id, 'cancel')}
                                                >
                                                    取消订单
                                                </button>
                                                <button
                                                    className="action-btn primary"
                                                    onClick={() => handleOrderAction(order.id, 'pay')}
                                                >
                                                    重新支付
                                                </button>
                                            </>
                                        )}

                                        {/* 状态显示 */}
                                        <div style={{
                                            fontSize: '12px',
                                            marginTop: '5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '41px',
                                            minWidth: '80px'
                                        }}>
                                            {(() => {
                                                const statusText = (() => {
                                                    // 优先显示订单的实际状态，而不是标签页的固定状态
                                                    switch (order.status) {
                                                        case OrderStatus.PENDING_PAYMENT:
                                                            return '待付款';
                                                        case OrderStatus.PAID:
                                                            return '待发货';
                                                        case OrderStatus.SHIPPED:
                                                            return '已发货';
                                                        case OrderStatus.RECEIVED:
                                                            return '已收货';
                                                        case OrderStatus.CANCELLED:
                                                            return '已取消';
                                                        case OrderStatus.PAYMENT_FAILED:
                                                            return '支付失败';
                                                        default:
                                                            return '未知状态';
                                                    }
                                                })();

                                                // 基础样式配置
                                                const baseStatusStyle = {
                                                    padding: '10px 20px',
                                                    borderRadius: '20px',
                                                    fontWeight: '600',
                                                    fontSize: '13px',
                                                    textAlign: 'center' as const,
                                                    minWidth: '70px',
                                                    transition: 'all 0.3s ease'
                                                };

                                                // 状态颜色配置
                                                const statusColors = {
                                                    '待付款': {
                                                        backgroundColor: '#fff2e8',
                                                        color: '#fa541c',
                                                        border: '1px solid #ffd8bf',
                                                        boxShadow: '0 2px 8px rgba(250, 84, 28, 0.15)'
                                                    },
                                                    '待发货': {
                                                        backgroundColor: '#e6f7ff',
                                                        color: '#1890ff',
                                                        border: '1px solid #91d5ff',
                                                        boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)'
                                                    },
                                                    '已发货': {
                                                        backgroundColor: '#e6f7ff',
                                                        color: '#1890ff',
                                                        border: '1px solid #91d5ff',
                                                        boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)'
                                                    },
                                                    '已收货': {
                                                        backgroundColor: '#f6ffed',
                                                        color: '#52c41a',
                                                        border: '1px solid #b7eb8f',
                                                        boxShadow: '0 2px 8px rgba(82, 196, 26, 0.15)'
                                                    },
                                                    '已取消': {
                                                        backgroundColor: '#fff1f0',
                                                        color: '#ff4d4f',
                                                        border: '1px solid #ffccc7',
                                                        boxShadow: '0 2px 8px rgba(255, 77, 79, 0.15)'
                                                    },
                                                    '支付失败': {
                                                        backgroundColor: '#fff2e8',
                                                        color: '#fa8c16',
                                                        border: '1px solid #ffd591',
                                                        boxShadow: '0 2px 8px rgba(250, 140, 22, 0.15)'
                                                    }
                                                };

                                                // 获取状态样式
                                                const getStatusStyle = (text: string) => {
                                                    const colors = statusColors[text as keyof typeof statusColors];
                                                    if (colors) {
                                                        return { ...baseStatusStyle, ...colors };
                                                    }
                                                    // 默认样式
                                                    return {
                                                        ...baseStatusStyle,
                                                        backgroundColor: '#f5f5f5',
                                                        color: '#666',
                                                        border: '1px solid #d9d9d9',
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                                    };
                                                };

                                                return (
                                                    <span style={getStatusStyle(statusText)}>
                                                        {statusText}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-container">
                                <div className="empty-icon">📦</div>
                                <p>暂无{(() => {
                                    switch (activeTab) {
                                        case 'all': return '';
                                        case 'pending_payment': return '待付款';
                                        case 'paid': return '待发货';
                                        case 'shipped': return '已发货';
                                        case 'received': return '已收货';
                                        default: return getStatusText(activeTab as OrderStatusType);
                                    }
                                })()}订单</p>
                                <button
                                    className="shop-btn"
                                    onClick={() => navigate('/classify')}
                                >
                                    去购物
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyOrder;