import React, { useEffect, useState } from 'react';
import './shopping.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GET } from '../../Axios/api';

const Shopping: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const getdata = async () => {
        const response = await GET(`/YSK/shop`);
        console.log(response.data.data.list)
        const product = response.data.data.list.find((item: any) => item._id === id);
        console.log(product)
        setOrderItems(product)
    }
    useEffect(() => {
        getdata()
    }, [])
    // 示例订单数据
    const [orderItems, setOrderItems] = useState<any>([]);

    // 数量控制（如果需要统一控制所有商品数量）
    const [quantity, setQuantity] = useState(1);


    return (
        <div className="shopping">
            {/* 粘性头部 */}
            <div className="headers">
                <div className="header-btn" onClick={() => {
                    navigate('/shoppdetail')
                }}>返回</div>
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
                {orderItems.map(item => (
                    <div className="product-info" key={item.id}>
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
                        </div>

                        {/* 商品价格 */}
                        <div className="product-price">¥{item.price}</div>
                    </div>
                ))}

                {/* 数量选择（如果需要统一控制数量） */}
                <div className="quantity-selector">
                    <span className="quantity-label">购买数量</span>
                    <div className="quantity-controls">
                        <button
                            className="quantity-btn"
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        >
                            -
                        </button>
                        <span className="quantity-value">{quantity}</span>
                        <button
                            className="quantity-btn"
                            onClick={() => setQuantity(q => q + 1)}
                        >
                            +
                        </button>
                    </div>
                </div>

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
                    <span>共{quantity}件，</span>
                    <span>合计：</span>
                    <span className="total-price">¥{quantity * orderItems[0].price}</span>
                </div>

                {/* 结算按钮 */}
                <button className="checkout-btn">结算</button>
            </div>
        </div>
    );
};

export default Shopping;