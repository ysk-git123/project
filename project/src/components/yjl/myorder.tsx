import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './myorder.moudle.css';
import { OrderStatus, type OrderStatusType, type Order } from '../../utils/orderData';

const MyOrder: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 从路由状态获取初始标签页
    const initialTab = location.state?.activeTab || 'all';
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>(initialTab);

    // 当路由状态改变时，更新活动标签页
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    // 获取订单数据
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                
                // 从本地存储获取用户信息
                const userData = localStorage.getItem('user');
                if (!userData) {
                    console.error('用户未登录');
                    navigate('/login');
                    return;
                }

                // 调用API获取订单数据
                const response = await fetch('/YSK/orders', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setOrders(data.data || []);
                    } else {
                        console.error('获取订单失败:', data.message);
                        setOrders([]);
                    }
                } else {
                    console.error('获取订单请求失败:', response.status);
                    setOrders([]);
                }
            } catch (error) {
                console.error('获取订单数据失败:', error);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

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

    // 过滤订单
    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        return order.status === activeTab;
    });

    // 处理订单操作
    const handleOrderAction = async (order: Order, action: string) => {
        switch (action) {
            case 'pay':
                // 跳转到支付页面
                navigate('/pendingPayment', { 
                    state: { 
                        orderId: order.id,
                        orderNumber: order.orderNumber,
                        items: order.items,
                        totalAmount: order.totalAmount
                    }
                });
                break;
            case 'cancel':
                if (confirm('确定要取消这个订单吗？')) {
                    try {
                        const response = await fetch(`/YSK/orders/${order.id}/cancel`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                            }
                        });

                        if (response.ok) {
                            // 更新本地订单状态
                            setOrders(prev => prev.map(o => 
                                o.id === order.id ? { ...o, status: OrderStatus.CANCELLED } : o
                            ));
                            alert('订单已取消');
                        } else {
                            alert('取消订单失败');
                        }
                    } catch (error) {
                        console.error('取消订单失败:', error);
                        alert('取消订单失败，请重试');
                    }
                }
                break;
            case 'confirm':
                if (confirm('确认已收到商品？')) {
                    try {
                        const response = await fetch(`/YSK/orders/${order.id}/confirm`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                            }
                        });

                        if (response.ok) {
                            // 更新本地订单状态
                            setOrders(prev => prev.map(o => 
                                o.id === order.id ? { ...o, status: OrderStatus.DELIVERED } : o
                            ));
                            alert('确认收货成功');
                        } else {
                            alert('确认收货失败');
                        }
                    } catch (error) {
                        console.error('确认收货失败:', error);
                        alert('确认收货失败，请重试');
                    }
                }
                break;
            case 'detail':
                // 查看订单详情
                console.log('查看订单详情:', order);
                break;
        }
    };

    // 获取操作按钮
    const getActionButtons = (order: Order) => {
        switch (order.status) {
            case OrderStatus.PENDING_PAYMENT:
                return (
                    <>
                        <button 
                            className="action-btn primary"
                            onClick={() => handleOrderAction(order, 'pay')}
                        >
                            立即付款
                        </button>
                        <button 
                            className="action-btn secondary"
                            onClick={() => handleOrderAction(order, 'cancel')}
                        >
                            取消订单
                        </button>
                    </>
                );
            case OrderStatus.PAID:
                return (
                    <button 
                        className="action-btn secondary"
                        onClick={() => handleOrderAction(order, 'detail')}
                    >
                        查看详情
                    </button>
                );
            case OrderStatus.SHIPPED:
                return (
                    <>
                        <button 
                            className="action-btn primary"
                            onClick={() => handleOrderAction(order, 'confirm')}
                        >
                            确认收货
                        </button>
                        <button 
                            className="action-btn secondary"
                            onClick={() => handleOrderAction(order, 'detail')}
                        >
                            查看物流
                        </button>
                    </>
                );
            case OrderStatus.DELIVERED:
                return (
                    <button 
                        className="action-btn secondary"
                        onClick={() => handleOrderAction(order, 'detail')}
                    >
                        查看详情
                    </button>
                );
            default:
                return (
                    <button 
                        className="action-btn secondary"
                        onClick={() => handleOrderAction(order, 'detail')}
                    >
                        查看详情
                    </button>
                );
        }
    };

    if (loading) {
        return (
            <div className="myorder-container">
                <div className="myorder-header">
                    <div className="header-back" onClick={() => navigate(-1)}>返回</div>
                    <div className="header-title">我的订单</div>
                    <div className="header-placeholder"></div>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="myorder-container">
            {/* 头部 */}
            <div className="myorder-header">
                <div className="header-back" onClick={() => navigate(-1)}>返回</div>
                <div className="header-title">我的订单</div>
                <div className="header-placeholder"></div>
            </div>

            {/* 状态标签页 */}
            <div className="order-tabs">
                <div 
                    className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    全部
                </div>
                <div 
                    className={`tab-item ${activeTab === OrderStatus.PENDING_PAYMENT ? 'active' : ''}`}
                    onClick={() => setActiveTab(OrderStatus.PENDING_PAYMENT)}
                >
                    待付款
                </div>
                <div 
                    className={`tab-item ${activeTab === OrderStatus.PAID ? 'active' : ''}`}
                    onClick={() => setActiveTab(OrderStatus.PAID)}
                >
                    已付款
                </div>
                <div 
                    className={`tab-item ${activeTab === OrderStatus.SHIPPED ? 'active' : ''}`}
                    onClick={() => setActiveTab(OrderStatus.SHIPPED)}
                >
                    已发货
                </div>
            </div>

            {/* 订单列表 */}
            <div className="order-list">
                {filteredOrders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="empty-icon">📦</div>
                        <p>暂无订单</p>
                        <p>快去购物吧！</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="order-item">
                            {/* 订单头部 */}
                            <div className="order-header">
                                <div className="order-number">
                                    订单号：{order.orderNumber}
                                </div>
                                <div className={`order-status ${getStatusClass(order.status)}`}>
                                    {getStatusText(order.status)}
                                </div>
                            </div>

                            {/* 订单商品 */}
                            <div className="order-products">
                                {order.items.map((item, index) => (
                                    <div key={index} className="product-item">
                                        <div className="product-image">
                                            <img src={item.image} alt={item.name} />
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
                                <div className="order-time">
                                    下单时间：{order.createTime}
                                </div>
                                <div className="order-total">
                                    总计：¥{order.totalAmount.toFixed(2)}
                                </div>
                            </div>

                            {/* 订单操作 */}
                            <div className="order-actions">
                                {getActionButtons(order)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyOrder;