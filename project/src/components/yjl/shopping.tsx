import React, { useState } from 'react';
import './shopping.css';
import { useNavigate, useLocation } from 'react-router-dom';

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
    
    // 计算总数量和总价格
    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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

            <div className="address-section">
                <div className="address-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="#666" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                </div>
                <div className="address-info">
                    <div className="recipient-line">
                        <span className="recipient">收货人: 张小五</span>
                        <span className="phone">13945678912</span>
                    </div>
                    <div className="address-detail">北京市 北京市昌平区 回龙观大街小区31号</div>
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
                <button className="checkout-btn">结算</button>
            </div>
        </div>
    );
};

export default Shopping;