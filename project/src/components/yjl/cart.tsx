import React from 'react';
import { useCart, getCartItemKey } from '../../utils/CartContext';
import { useNavigate } from 'react-router-dom';
import './cart.moudel.css';

const Cart: React.FC = () => {
    const { state, removeItem, getTotalPrice } = useCart();
    const navigate = useNavigate();

    const handleRemoveItem = (itemKey: string) => {
        removeItem(itemKey);
    };

    const handleCheckout = () => {
        if (state.items.length === 0) {
            alert('购物车为空，无法结算');
            return;
        }
        
        // 将购物车商品转换为订单格式
        const orderItems = state.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            color: item.color,
            size: item.size,
            quantity: item.quantity
        }));
        
        // 跳转到结算页面，传递购物车数据
        navigate('/shopping', {
            state: {
                orderItems: orderItems,
                fromCart: true // 标记来自购物车
            }
        });
    };

    return (
        <div className="cart-container">
            {/* 头部导航 */}
            <div className="cart-nav-header">
                <div className="nav-back-btn" onClick={() => navigate(-1)}>
                    返回
                </div>
                <div className="nav-title">购物车</div>
                <div className="nav-placeholder"></div>
            </div>

            {/* 购物车内容 */}
            {state.items.length === 0 ? (
                <div className="empty-cart">
                    <div className="empty-cart-icon">🛒</div>
                    <p>购物车是空的</p>
                    <p>快去添加一些商品吧！</p>
                </div>
            ) : (
                <>
                    {/* 商品列表 */}
                    <div className="cart-items">
                        {state.items.map((item) => {
                            const itemKey = getCartItemKey(item);
                            return (
                                <div key={itemKey} className="cart-item">
                                    <div className="item-image">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="item-info">
                                        <h3 className="item-name">{item.name}</h3>
                                        <p className="item-price">¥{item.price}</p>
                                        <p className="item-specs">
                                            颜色: {item.color} | 尺码: {item.size} | 数量: {item.quantity}
                                        </p>
                                    </div>
                                    <div className="item-actions">
                                        <div className="quantity-controls">
                                        
                                        </div>
                                        <button
                                            className="remove-btn"
                                            onClick={() => handleRemoveItem(itemKey)}
                                        >
                                            删除
                                        </button>
                                    </div>
                                    <div className="item-total">
                                        ¥{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 底部结算栏 */}
                    <div className="cart-footer">
                        <div className="cart-summary">
                            <div className="summary-line">
                                <span className="total-items">共 {state.items.reduce((total, item) => total + item.quantity, 0)} 件商品</span>
                                <span className="total-price">总计: ¥{getTotalPrice().toFixed(2)}</span>
                            </div>
                        </div>
                        <button 
                            className="checkout-btn"
                            onClick={handleCheckout}
                        >
                            结算
                        </button>
                    </div>
                </>
            )}
        </div>

    );
};

export default Cart;