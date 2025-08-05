import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser } from '../../utils/auth';
import { getMockOrders, calculateOrderStats, OrderStatus } from '../../utils/orderData';
import type { Order, OrderStatusType } from '../../utils/orderData';
import './myorder.moudle.css';

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
            // 尝试从API获取订单数据
            if (currentUser) {
                try {
                    const response = await fetch(`http://localhost:3000/YJL/orders/${currentUser.username}`);
                    if (response.ok) {
                        const result = await response.json();
                        if (result.code === 200 && result.data && result.data.length > 0) {
                            setOrders(result.data);
                            const stats = calculateOrderStats(result.data);
                            setOrderStats(stats);
                            return;
                        }
                    }
                } catch (error) {
                    console.warn('获取在线订单失败，使用模拟数据:', error);
                }
            }

            // 回退到模拟数据
            const mockOrders = getMockOrders();
            setOrders(mockOrders);
            const stats = calculateOrderStats(mockOrders);
            setOrderStats(stats);

        } catch (error) {
            console.error('获取订单失败:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // 页面加载时获取订单
    useEffect(() => {
        if (currentUser) {
            fetchOrders();
        } else {
            // 如果没有登录用户，仍然显示模拟数据
            const mockOrders = getMockOrders();
            setOrders(mockOrders);
            const stats = calculateOrderStats(mockOrders);
            setOrderStats(stats);
            setLoading(false);
        }
    }, [currentUser]);

    // 过滤订单
    const getFilteredOrders = (): Order[] => {
        switch (activeTab) {
            case 'pending_payment':
                return orders.filter(order => order.status === OrderStatus.PENDING_PAYMENT);
            case 'paid':
                return orders.filter(order => order.status === OrderStatus.PAID);
            case 'shipped':
                return orders.filter(order => order.status === OrderStatus.SHIPPED);
            case 'delivered':
                return orders.filter(order => order.status === OrderStatus.DELIVERED);
            default:
                return orders;
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
            case OrderStatus.DELIVERED:
                return '已送达';
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
            case OrderStatus.DELIVERED:
                return 'status-delivered';
            case OrderStatus.CANCELLED:
                return 'status-cancelled';
            case OrderStatus.PAYMENT_FAILED:
                return 'status-failed';
            default:
                return 'status-unknown';
        }
    };

    // 处理订单操作
    const handleOrderAction = async (orderId: string, action: string) => {
        try {
            switch (action) {
                case 'pay':
                    // 跳转到支付页面
                    const orderToPay = orders.find(order => order.id === orderId);
                    if (orderToPay) {
                        navigate('/pendingPayment', { state: orderToPay });
                    }
                    break;
                case 'cancel':
                    if (confirm('确定要取消这个订单吗？')) {
                        // 尝试调用API取消订单
                        try {
                            const response = await fetch(`http://localhost:3000/YJL/order/cancel/${orderId}`, {
                                method: 'POST'
                            });
                            if (response.ok) {
                                const result = await response.json();
                                if (result.code === 200) {
                                    fetchOrders(false);
                                    // 触发订单数据更新事件
                                    localStorage.setItem('orderDataUpdated', Date.now().toString());
                                    window.dispatchEvent(new CustomEvent('orderDataUpdated'));
                                    return;
                                }
                            }
                        } catch (error) {
                            console.warn('API取消订单失败，本地模拟:', error);
                        }

                        // 本地模拟取消
                        setOrders(prevOrders => 
                            prevOrders.map(order => 
                                order.id === orderId 
                                    ? { ...order, status: OrderStatus.CANCELLED }
                                    : order
                            )
                        );
                        // 触发订单数据更新事件
                        localStorage.setItem('orderDataUpdated', Date.now().toString());
                        window.dispatchEvent(new CustomEvent('orderDataUpdated'));
                    }
                    break;
                case 'confirm':
                    if (confirm('确认收货吗？')) {
                        // 尝试调用API确认收货
                        try {
                            const response = await fetch(`http://localhost:3000/YJL/order/confirm/${orderId}`, {
                                method: 'POST'
                            });
                            if (response.ok) {
                                const result = await response.json();
                                if (result.code === 200) {
                                    fetchOrders(false);
                                    // 触发订单数据更新事件
                                    localStorage.setItem('orderDataUpdated', Date.now().toString());
                                    window.dispatchEvent(new CustomEvent('orderDataUpdated'));
                                    return;
                                }
                            }
                        } catch (error) {
                            console.warn('API确认收货失败，本地模拟:', error);
                        }

                        // 本地模拟确认收货
                        setOrders(prevOrders => 
                            prevOrders.map(order => 
                                order.id === orderId 
                                    ? { ...order, status: OrderStatus.DELIVERED, deliveryTime: new Date().toLocaleString() }
                                    : order
                            )
                        );
                        // 触发订单数据更新事件
                        localStorage.setItem('orderDataUpdated', Date.now().toString());
                        window.dispatchEvent(new CustomEvent('orderDataUpdated'));
                    }
                    break;
                case 'view':
                    // 查看订单详情
                    navigate(`/order-detail/${orderId}`);
                    break;
                case 'delete':
                    if (confirm('确定要删除这个订单吗？删除后无法恢复。')) {
                        // 尝试调用API删除订单
                        try {
                            const response = await fetch(`http://localhost:3000/YJL/order/delete/${orderId}`, {
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
                                    alert('订单删除成功');
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
                    console.log('未知操作:', action);
            }
        } catch (error) {
            console.error('订单操作失败:', error);
            alert('操作失败，请重试');
        }
    };

    // 获取订单计数（包含徽章数字）
    const getOrderCounts = () => {
        return {
            all: orders.length,
            pending: orders.filter(order => order.status === OrderStatus.PENDING_PAYMENT).length,
            paid: orders.filter(order => order.status === OrderStatus.PAID).length,
            shipped: orders.filter(order => order.status === OrderStatus.SHIPPED).length,
            delivered: orders.filter(order => order.status === OrderStatus.DELIVERED).length
        };
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
                <div className="header-btn" onClick={() => navigate(-1)}>返回</div>
                <span className="header-title">我的订单</span>
                <div className="header-btn" onClick={() => fetchOrders(false)}>
                    {refreshing ? '刷新中...' : '刷新'}
                </div>
            </div>

            {/* 订单状态标签页 */}
            <div className="order-tabs">
                <div 
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
                    className={`tab-item ${activeTab === 'shipped' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shipped')}
                >
                    <div className="tab-content">
                        <span className="tab-text">待收货</span>
                        {orderCounts.shipped > 0 && (
                            <span className="tab-badge" data-count={orderCounts.shipped > 99 ? "99+" : orderCounts.shipped.toString()}>
                                {orderCounts.shipped > 99 ? "99+" : orderCounts.shipped}
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
                                        <div className={`order-status ${getStatusClass(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </div>
                                    </div>

                                    {/* 商品列表 */}
                                    <div className="order-products">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="product-item">
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
                                        <button 
                                            className="action-btn secondary"
                                            onClick={() => handleOrderAction(order.id, 'view')}
                                        >
                                            查看详情
                                        </button>
                                        
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
                                        
                                        {order.status === OrderStatus.SHIPPED && (
                                            <button 
                                                className="action-btn primary"
                                                onClick={() => handleOrderAction(order.id, 'confirm')}
                                            >
                                                确认收货
                                            </button>
                                        )}
                                        
                                        {order.status === OrderStatus.CANCELLED && (
                                            <button 
                                                className="action-btn danger"
                                                onClick={() => handleOrderAction(order.id, 'delete')}
                                            >
                                                删除订单
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-container">
                                <div className="empty-icon">📦</div>
                                <p>暂无{activeTab === 'all' ? '' : getStatusText(activeTab as OrderStatusType)}订单</p>
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