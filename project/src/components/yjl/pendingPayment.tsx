import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser } from '../../utils/auth';
import './pendingPayment.module.css';

// 订单项接口
interface OrderItem {
    id: string;
    name: string;
    price: number;
    image: string;
    color: string;
    size: string;
    quantity: number;
}

// 支付状态常量
const PaymentStatus = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SUCCESS: 'success',
    FAILED: 'failed'
} as const;

type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];

// 用户信息接口
interface UserInfo {
    id: string;
    username: string;
    name?: string;
    image?: string;
    phone?: string;
    email?: string;
}

const PendingPayment: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 从路由状态获取订单数据
    const orderData = location.state;
    const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType>(PaymentStatus.PENDING);
    const [paymentMethod, setPaymentMethod] = useState<string>('alipay');
    const [countdown, setCountdown] = useState<number>(900); // 15分钟倒计时
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);

    // 获取当前登录用户
    useEffect(() => {
        const user = getUser();
        setCurrentUser(user);
    }, []);

    // 倒计时效果
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            // 倒计时结束，订单自动取消
            alert('支付超时，订单已自动取消');
            navigate('/myorder');
        }
    }, [countdown, navigate]);

    // 格式化倒计时显示
    const formatCountdown = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // 处理支付
    const handlePayment = async () => {
        if (!currentUser) {
            alert('请先登录后再进行支付');
            navigate('/login');
            return;
        }

        setIsPaymentLoading(true);
        setPaymentStatus(PaymentStatus.PROCESSING);

        try {
            const amount = orderData.totalAmount.toFixed(2);
            const username = currentUser.username || currentUser.name || `用户_${currentUser.id}`;
            
            const response = await fetch(`http://localhost:3000/YJL/zf?username=${encodeURIComponent(username)}&amount=${amount}`);
            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                // 在新窗口打开支付页面
                const payWindow = window.open(result.data.payUrl, '_blank', 'width=800,height=600');
                
                // 监听支付完成
                const checkPaymentStatus = () => {
                    if (payWindow?.closed) {
                        // 支付窗口关闭，可能支付完成
                        setPaymentStatus(PaymentStatus.SUCCESS);
                        alert('支付成功！订单将在几分钟内处理。');
                        
                        // 跳转到订单页面
                        setTimeout(() => {
                            navigate('/myorder');
                        }, 2000);
                    } else {
                        setTimeout(checkPaymentStatus, 1000);
                    }
                };
                
                setTimeout(checkPaymentStatus, 1000);
                
            } else {
                setPaymentStatus(PaymentStatus.FAILED);
                alert(`创建支付失败: ${result.message}`);
            }
        } catch (error) {
            console.error('支付请求失败:', error);
            setPaymentStatus(PaymentStatus.FAILED);
            alert('支付请求失败，请重试');
        } finally {
            setIsPaymentLoading(false);
        }
    };

    // 取消订单
    const handleCancelOrder = () => {
        if (confirm('确定要取消这个订单吗？')) {
            navigate('/myorder');
        }
    };

    // 如果没有订单数据，显示错误
    if (!orderData) {
        return (
            <div className="pending-payment-container">
                <div className="payment-header">
                    <div className="header-back" onClick={() => navigate(-1)}>返回</div>
                    <div className="header-title">待付款</div>
                    <div className="header-placeholder"></div>
                </div>
                <div className="error-container">
                    <div className="error-icon">❌</div>
                    <p>订单信息不存在</p>
                    <button 
                        className="back-btn"
                        onClick={() => navigate('/myorder')}
                    >
                        返回订单列表
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pending-payment-container">
            {/* 头部 */}
            <div className="payment-header">
                <div className="header-back" onClick={() => navigate(-1)}>返回</div>
                <div className="header-title">待付款</div>
                <div className="header-placeholder"></div>
            </div>

            {/* 倒计时 */}
            <div className="countdown-section">
                <div className="countdown-icon">⏰</div>
                <div className="countdown-info">
                    <div className="countdown-text">请在以下时间内完成支付</div>
                    <div className="countdown-time">{formatCountdown(countdown)}</div>
                </div>
            </div>

            {/* 订单信息 */}
            <div className="order-section">
                <div className="section-title">订单信息</div>
                <div className="order-number">
                    订单号：{orderData.orderNumber}
                </div>
                
                {/* 商品列表 */}
                <div className="products-list">
                    {orderData.items.map((item: OrderItem, index: number) => (
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

                {/* 订单总计 */}
                <div className="order-total">
                    <span>总计：</span>
                    <span className="total-price">¥{orderData.totalAmount.toFixed(2)}</span>
                </div>
            </div>

            {/* 支付方式 */}
            <div className="payment-method-section">
                <div className="section-title">支付方式</div>
                <div className="payment-options">
                    <label className={`payment-option ${paymentMethod === 'alipay' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            value="alipay"
                            checked={paymentMethod === 'alipay'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <div className="payment-option-content">
                            <div className="payment-icon">💰</div>
                            <div className="payment-info">
                                <div className="payment-name">支付宝支付</div>
                                <div className="payment-desc">安全快捷，支持花呗分期</div>
                            </div>
                        </div>
                    </label>
                    
                    <label className={`payment-option ${paymentMethod === 'wechat' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            value="wechat"
                            checked={paymentMethod === 'wechat'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <div className="payment-option-content">
                            <div className="payment-icon">💚</div>
                            <div className="payment-info">
                                <div className="payment-name">微信支付</div>
                                <div className="payment-desc">便捷支付，零钱理财</div>
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {/* 用户信息 */}
            <div className="user-info-section">
                <div className="section-title">支付信息</div>
                <div className="user-display-group">
                    {currentUser ? (
                        <div className="user-info-display">
                            <div className="user-avatar">👤</div>
                            <div className="user-details">
                                <div className="user-name">
                                    {currentUser.username || currentUser.name || '当前用户'}
                                </div>
                                <div className="user-id">
                                    ID: {currentUser.id || 'Unknown'}
                                </div>
                            </div>
                            <div className="login-status">
                                <span className="status-badge">已登录</span>
                            </div>
                        </div>
                    ) : (
                        <div className="user-info-display">
                            <div className="user-avatar">❌</div>
                            <div className="user-details">
                                <div className="user-name">未登录</div>
                                <div className="user-hint">请先登录后再进行支付</div>
                            </div>
                            <button 
                                className="login-btn"
                                onClick={() => navigate('/login')}
                            >
                                去登录
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 支付按钮 */}
            <div className="payment-actions">
                <button 
                    className={`cancel-btn`}
                    onClick={handleCancelOrder}
                    disabled={isPaymentLoading}
                >
                    取消订单
                </button>
                <button 
                    className={`pay-btn ${isPaymentLoading ? 'loading' : ''}`}
                    onClick={paymentMethod === 'alipay' ? handlePayment : () => alert('暂不支持微信支付，请选择支付宝支付')}
                    disabled={isPaymentLoading || paymentMethod !== 'alipay' || !currentUser}
                >
                    {isPaymentLoading ? '创建订单中...' : 
                     !currentUser ? '请先登录' :
                     paymentMethod !== 'alipay' ? '请选择支付宝支付' :
                     `立即支付 ¥${orderData.totalAmount.toFixed(2)}`}
                </button>
            </div>

            {/* 支付状态提示 */}
            {paymentStatus === PaymentStatus.SUCCESS && (
                <div className="payment-status success">
                    <div className="status-icon">✅</div>
                    <div className="status-text">支付成功！正在跳转...</div>
                </div>
            )}
            
            {paymentStatus === PaymentStatus.FAILED && (
                <div className="payment-status failed">
                    <div className="status-icon">❌</div>
                    <div className="status-text">支付失败，请重试</div>
                </div>
            )}
        </div>
    );
};

export default PendingPayment;
