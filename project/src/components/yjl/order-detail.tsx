import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser } from '../../utils/auth';
import { getMockOrders, OrderStatus } from '../../utils/orderData';
import type { Order, OrderStatusType } from '../../utils/orderData';
import './order-detail.moudle.css';

// 用户信息接口
interface UserInfo {
    id: string;
    username: string;
    name?: string;
    image?: string;
    phone?: string;
    email?: string;
}

const OrderDetail: React.FC = () => {
    const navigate = useNavigate();
    const { orderId } = useParams<{ orderId: string }>();
    
    const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 获取当前登录用户
    useEffect(() => {
        const user = getUser();
        setCurrentUser(user);
    }, []);

    // 获取订单详情
    const fetchOrderDetail = async () => {
        setLoading(true);
        setError(null);

        try {
            // 尝试从API获取订单详情
            if (currentUser && orderId) {
                try {
                    console.log('正在获取订单详情:', orderId);
                    const response = await fetch(`http://localhost:3000/YJL/order/${orderId}`);
                    console.log('API响应状态:', response.status);
                    
                    if (response.ok) {
                        const result = await response.json();
                        console.log('API响应数据:', result);
                        
                        if (result.code === 200 && result.data) {
                            setOrder(result.data);
                            return;
                        } else {
                            console.warn('API返回错误:', result);
                        }
                    } else {
                        console.warn('API请求失败，状态码:', response.status);
                    }
                } catch (error) {
                    console.warn('获取在线订单详情失败，使用模拟数据:', error);
                }
            }

            // 回退到模拟数据
            console.log('使用模拟数据');
            const mockOrders = getMockOrders();
            
            // 如果是MongoDB ObjectId格式，尝试使用模拟订单
            if (orderId && orderId.length === 24) {
                // 这是MongoDB ObjectId格式，使用第一个模拟订单
                console.log('检测到MongoDB ObjectId格式，使用模拟订单');
                setOrder(mockOrders[0]);
                return;
            }
            
            const foundOrder = mockOrders.find(o => o.id === orderId);
            
            if (foundOrder) {
                console.log('找到模拟订单:', foundOrder);
                setOrder(foundOrder);
            } else {
                console.warn('未找到订单:', orderId);
                // 如果找不到订单，使用第一个模拟订单作为演示
                console.log('使用第一个模拟订单作为演示');
                setOrder(mockOrders[0]);
            }

        } catch (error) {
            console.error('获取订单详情失败:', error);
            setError('获取订单详情失败');
        } finally {
            setLoading(false);
        }
    };

    // 页面加载时获取订单详情
    useEffect(() => {
        if (orderId) {
            fetchOrderDetail();
        }
    }, [orderId, currentUser]);

    // 获取状态文本
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
    const handleOrderAction = async (action: string) => {
        if (!order) return;

        try {
            // 这里可以调用相应的API
            console.log(`执行订单操作: ${action}`, order.id);
            
            // 根据操作类型执行不同逻辑
            switch (action) {
                case 'pay':
                    navigate('/payment', { 
                        state: { 
                            orderId: order.id,
                            amount: order.totalAmount,
                            returnUrl: `/order-detail/${order.id}`
                        } 
                    });
                    break;
                case 'cancel':
                    if (confirm('确定要取消这个订单吗？')) {
                        // 调用取消订单API
                        console.log('取消订单:', order.id);
                        // 刷新订单详情
                        fetchOrderDetail();
                    }
                    break;
                case 'confirm':
                    if (confirm('确认已收到商品吗？')) {
                        // 调用确认收货API
                        console.log('确认收货:', order.id);
                        // 刷新订单详情
                        fetchOrderDetail();
                    }
                    break;
                case 'refund':
                    navigate('/refund', { 
                        state: { 
                            orderId: order.id,
                            order: order
                        } 
                    });
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('订单操作失败:', error);
            alert('操作失败，请重试');
        }
    };

    // 返回上一页
    const handleBack = () => {
        navigate(-1);
    };

    // 复制订单号
    const copyOrderNumber = () => {
        if (order) {
            navigator.clipboard.writeText(order.orderNumber);
            alert('订单号已复制到剪贴板');
        }
    };

    if (loading) {
        return (
            <div className="order-detail-container">
                <div className="loading">加载中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-detail-container">
                <div className="error">
                    <p>{error}</p>
                    <button onClick={handleBack} className="back-btn">返回</button>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-detail-container">
                <div className="error">
                    <p>订单不存在</p>
                    <button onClick={handleBack} className="back-btn">返回</button>
                </div>
            </div>
        );
    }

    return (
        <div className="order-detail-container">
            {/* 头部 */}
            <div className="header">
                <button onClick={handleBack} className="back-btn">
                    <span>←</span>
                </button>
                <h1>订单详情</h1>
            </div>

            {/* 订单状态 */}
            <div className="status-section">
                <div className={`status-badge ${getStatusClass(order.status)}`}>
                    {getStatusText(order.status)}
                </div>
                <p className="status-desc">
                    {order.status === OrderStatus.PENDING_PAYMENT && '请在30分钟内完成支付'}
                    {order.status === OrderStatus.PAID && '商家正在处理您的订单'}
                    {order.status === OrderStatus.SHIPPED && '商品正在配送中'}
                    {order.status === OrderStatus.DELIVERED && '订单已完成'}
                    {order.status === OrderStatus.CANCELLED && '订单已取消'}
                    {order.status === OrderStatus.PAYMENT_FAILED && '支付失败，请重新支付'}
                </p>
            </div>

            {/* 订单信息 */}
            <div className="order-info-section">
                <h3>订单信息</h3>
                <div className="info-item">
                    <span className="label">订单号：</span>
                    <span className="value">{order.orderNumber}</span>
                    <button onClick={copyOrderNumber} className="copy-btn">复制</button>
                </div>
                <div className="info-item">
                    <span className="label">下单时间：</span>
                    <span className="value">{order.createTime}</span>
                </div>
                {order.paymentTime && (
                    <div className="info-item">
                        <span className="label">支付时间：</span>
                        <span className="value">{order.paymentTime}</span>
                    </div>
                )}
                {order.shippingTime && (
                    <div className="info-item">
                        <span className="label">发货时间：</span>
                        <span className="value">{order.shippingTime}</span>
                    </div>
                )}
                {order.deliveryTime && (
                    <div className="info-item">
                        <span className="label">送达时间：</span>
                        <span className="value">{order.deliveryTime}</span>
                    </div>
                )}
            </div>

            {/* 配送信息 */}
            <div className="delivery-section">
                <h3>配送信息</h3>
                <div className="delivery-info">
                    <div className="recipient">
                        <span className="name">{order.address.recipient}</span>
                        <span className="phone">{order.address.phone}</span>
                    </div>
                    <div className="address">
                        {order.address.province} {order.address.city} {order.address.district} {order.address.detail}
                    </div>
                </div>
            </div>

            {/* 商品列表 */}
            <div className="products-section">
                <h3>商品信息</h3>
                <div className="products-list">
                    {order.items.map((item) => (
                        <div key={item.id} className="product-item">
                            <div className="product-image">
                                <img src={item.image} alt={item.name} />
                            </div>
                            <div className="product-info">
                                <div className="product-name">{item.name}</div>
                                <div className="product-spec">
                                    {item.color} | {item.size}
                                </div>
                                <div className="product-price">
                                    <span className="price">¥{item.price.toFixed(2)}</span>
                                    <span className="quantity">x{item.quantity}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 买家留言 */}
            {order.message && (
                <div className="message-section">
                    <h3>买家留言</h3>
                    <div className="message-content">{order.message}</div>
                </div>
            )}

            {/* 支付信息 */}
            <div className="payment-section">
                <h3>支付信息</h3>
                <div className="payment-info">
                    <div className="info-item">
                        <span className="label">支付方式：</span>
                        <span className="value">{order.paymentMethod}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">商品总额：</span>
                        <span className="value">¥{order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="info-item total">
                        <span className="label">实付金额：</span>
                        <span className="value">¥{order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* 操作按钮 */}
            <div className="action-buttons">
                {order.status === OrderStatus.PENDING_PAYMENT && (
                    <>
                        <button 
                            onClick={() => handleOrderAction('pay')} 
                            className="action-btn primary"
                        >
                            立即支付
                        </button>
                        <button 
                            onClick={() => handleOrderAction('cancel')} 
                            className="action-btn secondary"
                        >
                            取消订单
                        </button>
                    </>
                )}
                
                {order.status === OrderStatus.SHIPPED && (
                    <button 
                        onClick={() => handleOrderAction('confirm')} 
                        className="action-btn primary"
                    >
                        确认收货
                    </button>
                )}
                
                {order.status === OrderStatus.DELIVERED && (
                    <button 
                        onClick={() => handleOrderAction('refund')} 
                        className="action-btn secondary"
                    >
                        申请退款
                    </button>
                )}
                
                {(order.status === OrderStatus.PAID || order.status === OrderStatus.SHIPPED) && (
                    <button 
                        onClick={() => handleOrderAction('cancel')} 
                        className="action-btn secondary"
                    >
                        申请退款
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderDetail;
