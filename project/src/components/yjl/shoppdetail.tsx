import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './shoppdetail.css';
import { useCart } from '../../utils/CartContext';
import type { CartItem } from '../../utils/CartContext';

// 定义商品数据类型
interface ShopData {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    color: string[];
    size: string[];
    description: string;
}

const Shoppdetail: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addItem } = useCart();
    
    // 从location.state中获取完整的商品数据
    const productData = location.state?.product;
    console.log('接收到的商品数据:', productData);
    
    const services = [
        "满100元包邮",
        "新用户首单免费",
        "正品保证",
        "7天无理由退货"
    ];
    
    // 状态管理
    const [isCollected, setIsCollected] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [ShopData] = useState<ShopData | null>(productData || null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [isBuyNow, setIsBuyNow] = useState(false); // 区分是加入购物车还是立即购买
    
    // 如果没有传递商品数据，则从URL参数获取ID并请求数据（兼容性处理）
    useEffect(() => {
        if (!productData) {
            const id = new URLSearchParams(location.search).get('id');
            if (id) {
                console.log('从URL参数获取商品ID:', id);
                // 这里可以保留原来的API请求逻辑作为备用
                // 但主要使用传递的数据
            }
        }
    }, [productData, location.search]);
    
    const toggleCollect = () => {
        setIsCollected(!isCollected);
    };

    const openPopup = () => {
        // 重置选择状态为初始值
        setSelectedColor(null);
        setSelectedSize(null);
        setQuantity(1);
        setIsBuyNow(false); // 标记为加入购物车
        setShowPopup(true);
    };

    const openBuyNowPopup = () => {
        // 重置选择状态为初始值
        setSelectedColor(null);
        setSelectedSize(null);
        setQuantity(1);
        setIsBuyNow(true); // 标记为立即购买
        setShowPopup(true);
    };

    const closePopup = () => {
        // 检查是否所有选项都已选择
        if (selectedColor && selectedSize && ShopData) {
            if (isBuyNow) {
                // 立即购买：跳转到订单确认页面
                const orderItem = {
                    id: ShopData._id,
                    name: ShopData.name,
                    price: ShopData.price,
                    image: ShopData.image,
                    color: selectedColor,
                    size: selectedSize,
                    quantity: quantity,
                    description: ShopData.description
                };
                
                navigate(`/shopping`, { 
                    state: { 
                        orderItems: [orderItem],
                        quantity: quantity
                    } 
                });
            } else {
                // 加入购物车
                const cartItem: CartItem = {
                    id: ShopData._id,
                    name: ShopData.name,
                    price: ShopData.price,
                    image: ShopData.image,
                    color: selectedColor,
                    size: selectedSize,
                    quantity: quantity,
                };
                
                addItem(cartItem);
                
                // 显示成功消息
                setShowSuccessMessage(true);
                setTimeout(() => {
                    setShowSuccessMessage(false);
                }, 3000);
                
                navigate(`/cart`);
            }
        }
        setShowPopup(false);
    };

    const changeQuantity = (type: 'increase' | 'decrease') => {
        if (type === 'increase') {
            setQuantity(prev => prev + 1);
        } else {
            setQuantity(prev => Math.max(1, prev - 1));
        }
    };

    const selectColor = (color: string) => {
        setSelectedColor(color);
    };

    const selectSize = (size: string) => {
        setSelectedSize(size);
    };

    // 如果没有商品数据，显示加载状态
    if (!ShopData) {
        return (
            <div className="shoppdetail">
                <div className="headers">
                    <div className="header-btn" onClick={() => navigate(-1)}>返回</div>
                    <span className="header-title">商品详情</span>
                    <div className="header-btn">分享</div>
                </div>
                <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                    <p>正在加载商品信息...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="shoppdetail">
            {/* 粘性头部 */}
            <div className="headers">
                <div className="header-btn" onClick={() => navigate(-1)}>返回</div>
                <span className="header-title">商品详情</span>
                <div className="header-btn">分享</div>
            </div>
            
            {/* 成功提示消息 */}
            {showSuccessMessage && (
                <div className="success-message">
                    <span>✅ 商品已成功添加到购物车！</span>
                </div>
            )}
            
            {/* 商品图片 */}
            <div className="product-image-container">
                <img src={ShopData.image} alt="商品图片" className='headerimg' />
            </div>

            {/* 价格和信息 */}
            <div className='detailone'>
                <p className='headerp'>¥{ShopData.price}</p>
                <p>{ShopData.name}</p>
            </div>

            {/* 服务卡片 */}
            <div className="card" style={{ margin: '10px 0' }}>
                <div className='container'>
                    {services.map((service, index) => (
                        <div key={index} className='serviceItem'>
                            <img
                                src="./对号面.png"
                                alt="服务图标"
                                className='serviceIcon'
                            />
                            <span>{service}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 参数卡片 */}
            <div className="card">
                <div className='detailtwo'>
                    <p style={{ fontWeight: 'bold' }}>参数</p>
                    <p className="detailtwop"><span>上市时间:</span><span>2017年秋季</span></p>
                    <p className="detailtwop"><span>商品系列:</span><span>{ShopData.category}</span></p>
                    <p className="detailtwop"><span>可选颜色:</span><span>{ShopData.color.join(', ')}</span></p>
                    <p className="detailtwop"><span>可选尺码:</span><span>{ShopData.size.join(', ')}</span></p>
                </div>
            </div>

            {/* 商品详情卡片 */}
            <div className="card" style={{ marginTop: '10px' }}>
                <p style={{ fontWeight: 'bold', paddingBottom: '10px' }}>商品详情</p>
                <div className="detail-content">
                    {ShopData.description}
                </div>
            </div>

            {/* 底部栏 */}
            <div className="bottom-bar">
                <div className="bar-item">
                    <span className="text">客服</span>
                </div>
                <div className="bar-item" onClick={toggleCollect}>
                    <span className={`text ${isCollected ? 'active' : ''}`}>收藏</span>
                </div>
                <div className="bar-item action add-to-cart" onClick={openPopup}>
                    加入购物车
                </div>
                <div className="bar-item action buy-now" onClick={openBuyNowPopup}>
                    立即购买
                </div>
            </div>

            {/* 弹出框 */}
            {
                showPopup && ShopData && (
                    <div className="popup-overlay" onClick={() => setShowPopup(false)}>
                        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                            <div className="popup-image-placeholder">
                                <img src={ShopData.image} alt="商品图片" className='headerimg' />
                            </div>
                            <div className="popup-info">
                                <p>¥{ShopData.price}</p>
                                <p>库存49件</p>
                                {/* 条件显示选择结果 */}
                                {selectedColor && selectedSize ? (
                                    <p>已选择 {selectedColor} {selectedSize}</p>
                                ) : (
                                    <p style={{ color: 'red' }}>请选择颜色和尺码</p>
                                )}
                            </div>
                            <div className="popup-options">
                                {/* 颜色选择 */}
                                <div>
                                    <p>颜色</p>
                                    <div className="popup-buttons">
                                        {ShopData.color.map((color: string) => (
                                            <button
                                                key={color}
                                                className={color === selectedColor ? 'active' : ''}
                                                onClick={() => selectColor(color)}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 尺码选择 */}
                                <div>
                                    <p>尺码</p>
                                    <div className="popup-buttons">
                                        {ShopData.size.map((size: string) => (
                                            <button
                                                key={size}
                                                className={size === selectedSize ? 'active' : ''}
                                                onClick={() => selectSize(size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 数量选择 */}
                                <div>
                                    <p>购买数量</p>
                                    <div className="popup-quantity">
                                        <button onClick={() => changeQuantity('decrease')}>-</button>
                                        <span>{quantity}</span>
                                        <button onClick={() => changeQuantity('increase')}>+</button>
                                    </div>
                                </div>
                            </div>

                            {/* 确定按钮 */}
                            <button
                                className="popup-confirm"
                                onClick={closePopup}
                                style={{
                                    backgroundColor: selectedColor && selectedSize ? '#ff6700' : '#ccc',
                                    cursor: selectedColor && selectedSize ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {selectedColor && selectedSize ? '确定' : '请完成选择'}
                            </button>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default Shoppdetail;