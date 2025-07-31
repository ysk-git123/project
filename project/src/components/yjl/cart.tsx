import React from 'react';
import { useCart, getCartItemKey } from '../../utils/CartContext';
import './cart.css';

const Cart: React.FC = () => {
    const { state, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();

    const handleQuantityChange = (itemKey: string, newQuantity: number) => {
        if (newQuantity > 0) {
            updateQuantity(itemKey, newQuantity);
        }
    };

    const handleRemoveItem = (itemKey: string) => {
        removeItem(itemKey);
    };

    const handleClearCart = () => {
        clearCart();
    };

    return (
        <div className="cart-container">
            {/* 头部 */}
            <div className="cart-header">
                <h1>购物车</h1>
                {state.items.length > 0 && (
                    <button className="clear-cart-btn" onClick={handleClearCart}>
                        清空购物车
                    </button>
                )}
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
                                            颜色: {item.color} | 尺码: {item.size}
                                        </p>
                                    </div>
                                    <div className="item-actions">
                                        <div className="quantity-controls">
                                            <button 
                                                onClick={() => handleQuantityChange(itemKey, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="quantity">{item.quantity}</span>
                                            <button 
                                                onClick={() => handleQuantityChange(itemKey, item.quantity + 1)}
                                            >
                                                +
                                            </button>
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
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;