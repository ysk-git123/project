import React, { useState, useEffect } from 'react';
import './shopping.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser } from '../../utils/auth';
import AddressSelector from './AddressSelector';
import { useCart } from '../../utils/CartContext';

// 定义商品数据类型
interface OrderItem {
    id: string;
    name: string;
    price: number;
    image: string;
    color: string;
    size: string;
    quantity: number;
}

const Shopping: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 从location.state中获取订单数据
    const orderData = location.state?.orderItems;
    const fromCart = location.state?.fromCart || false;
    
    console.log('接收到的订单数据:', orderData);
    console.log('是否来自购物车:', fromCart);
    
    // 状态管理
    const [orderItems] = useState<OrderItem[]>(orderData || []);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('alipay');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showAddressSelector, setShowAddressSelector] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<any>({
        recipient: '张小五',
        phone: '13945678912',
        province: '北京市',
        city: '北京市',
        district: '昌平区',
        detail: '回龙观大街小区31号'
    });
    
    // 获取购物车上下文
    const { clearCart } = useCart();
    
    // 获取当前登录用户
    useEffect(() => {
        const user = getUser();
        setCurrentUser(user);
    }, []);

    // 计算总数量和总价格
    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 创建支付订单
    const createPayment = async () => {
        setIsPaymentLoading(true);
        try {
            // 检查用户是否已登录
            if (!currentUser) {
                alert('请先登录后再进行支付');
                navigate('/login');
                return;
            }
            
            const amount = totalPrice.toFixed(2);
            // 使用当前登录用户的用户名
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
                        alert('支付窗口已关闭！如果已完成支付，订单将在几分钟内处理。');
                        
                        // 如果来自购物车，支付成功后清空购物车
                        if (fromCart) {
                            clearCart();
                            alert('支付成功！购物车已清空');
                        }
                        
                        // 可以跳转到订单页面或其他处理
                        navigate('/shou'); // 跳转到首页
                    } else {
                        setTimeout(checkPaymentStatus, 1000);
                    }
                };
                
                setTimeout(checkPaymentStatus, 1000);
                
            } else {
                alert(`创建支付失败: ${result.message}`);
            }
        } catch (error) {
            console.error('支付请求失败:', error);
            alert('支付请求失败，请重试');
        } finally {
            setIsPaymentLoading(false);
        }
    };

    // 如果没有传递数据，显示加载状态
    if (!orderData || orderData.length === 0) {
        return (
            <div className="shopping">
                <div className="headers">
                    <div className="header-btn" onClick={() => navigate(-1)}>返回</div>
                    <span className="header-title">确认订单</span>
                    <div className="header-btn"></div>
                </div>
                <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                    <p>正在加载订单信息...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="shopping">
            {/* 粘性头部 */}
            <div className="headers">
                <div className="header-btn" onClick={() => navigate(-1)}>返回</div>
                <span className="header-title">确认订单</span>
                <div className="header-btn"></div>
            </div>

            <div className="address-section" onClick={() => setShowAddressSelector(true)}>
                <div className="address-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="#666" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                </div>
                <div className="address-info">
                    <div className="recipient-line">
                        <span className="recipient">收货人: {selectedAddress.recipient}</span>
                        <span className="phone">{selectedAddress.phone}</span>
                    </div>
                    <div className="address-detail">
                        {selectedAddress.province} {selectedAddress.city} {selectedAddress.district} {selectedAddress.detail}
                    </div>
                </div>
                <div className="arrow-right">›</div>
            </div>

            <div className="order-container">
                {/* 渲染订单商品 */}
                {orderItems.map((item, index) => (
                    <div className="product-info" key={index}>
                        {/* 商品图片 */}
                        <div>
                            <img
                                src={item.image}
                                alt={item.name}
                                className="product-image-placeholder" />
                        </div>

                        {/* 商品详情 */}
                        <div className="product-details">
                            <div className="product-title">{item.name}</div>
                            <div className="product-attrs">
                                {item.color} {item.size}
                            </div>
                            <div className="product-quantity">
                                数量: {item.quantity}
                            </div>
                        </div>

                        {/* 商品价格 */}
                        <div className="product-price">¥{item.price}</div>
                    </div>
                ))}

                {/* 优惠信息 */}
                <div className="discount-info">
                    <span className="discount-label">优惠</span>
                    <span className="discount-detail">无优惠</span>
                </div>

                {/* 配送方式 */}
                <div className="shipping-method">
                    <span>配送方式</span>
                    <span>快递 免邮</span>
                </div>

                {/* 用户信息 */}
                <div className="user-info-section">
                    <div className="user-info-title">支付信息</div>
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

                {/* 支付方式选择 */}
                <div className="payment-method-section">
                    <div className="payment-method-title">支付方式</div>
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

                {/* 买家留言 */}
                <div className="buyer-message">
                    <div className="message-label">买家留言</div>
                    <textarea
                        className="message-input"
                        placeholder="给卖家留言"
                    ></textarea>
                </div>

                {/* 订单总计 */}
                <div className="order-summary">
                    <span>共{totalQuantity}件，</span>
                    <span>合计：</span>
                    <span className="total-price">¥{totalPrice.toFixed(2)}</span>
                </div>

                {/* 结算按钮 */}
                <div className="checkout-section">
                    <div className="checkout-summary">
                        <div className="checkout-total">
                            <span>共{totalQuantity}件商品，总计：</span>
                            <span className="checkout-price">¥{totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="checkout-tip">
                            {paymentMethod === 'alipay' ? '支付宝安全支付' : '暂不支持微信支付'}
                        </div>
                    </div>
                    <button 
                        className={`checkout-btn ${isPaymentLoading ? 'loading' : ''}`}
                        onClick={paymentMethod === 'alipay' ? createPayment : () => alert('暂不支持微信支付，请选择支付宝支付')}
                        disabled={isPaymentLoading || paymentMethod !== 'alipay' || !currentUser}
                    >
                        {isPaymentLoading ? '创建订单中...' : 
                         !currentUser ? '请先登录' :
                         paymentMethod !== 'alipay' ? '请选择支付宝支付' :
                         `立即支付 ¥${totalPrice.toFixed(2)}`}
                    </button>
                </div>
            </div>
            
            {/* 地址选择器 */}
            {showAddressSelector && (
                <AddressSelector
                    currentAddress={selectedAddress}
                    onAddressSelect={(address) => {
                        setSelectedAddress(address);
                        setShowAddressSelector(false);
                    }}
                    onClose={() => setShowAddressSelector(false)}
                />
            )}
        </div>
    );
};

export default Shopping;