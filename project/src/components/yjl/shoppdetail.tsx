import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './shoppdetail.css';
import { GET } from '../../Axios/api'
import { useSearchParams } from 'react-router-dom';
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
}

const Shoppdetail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    console.log(id)
    const navigate = useNavigate();
    const { addItem } = useCart();
    
    const services = [
        "满100元包邮",
        "新用户首单免费",
        "正品保证",
        "7天无理由退货"
    ];
    
    const getdata = async () => {
        const response = await GET(`/YSK/shop`);
        console.log(response.data.data.list)
        const product = response.data.data.list.find((item: ShopData) => item._id === id);
        console.log(product)
        setShopData(product)
    }
    
    useEffect(() => {
        getdata()
    }, [])
    
    // 状态管理
    const [isCollected, setIsCollected] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [ShopData, setShopData] = useState<ShopData | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    
    const toggleCollect = () => {
        setIsCollected(!isCollected);
    };

    const openPopup = () => {
        // 重置选择状态为初始值
        setSelectedColor(null);
        setSelectedSize(null);
        setQuantity(1);
        setShowPopup(true);
    };

    const closePopup = () => {
        // 检查是否所有选项都已选择
        if (selectedColor && selectedSize && ShopData) {
            // 创建购物车商品对象
            const cartItem: CartItem = {
                id: ShopData._id,
                name: ShopData.name,
                price: ShopData.price,
                image: ShopData.image,
                color: selectedColor,
                size: selectedSize,
                quantity: quantity
            };
            
            // 添加到购物车
            addItem(cartItem);
            
            // 显示成功消息
            setShowSuccessMessage(true);
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
            
            // 跳转到购物车页面
            navigate(`/cart?id=${id}`);
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
            
            {
                ShopData && (
                    <>
                        {/* 商品图片 */}
                        < div className="product-image-container">
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
                            </div>
                        </div>

                        {/* 商品详情卡片 */}
                        <div className="card" style={{ marginTop: '10px' }}>
                            <p style={{ fontWeight: 'bold', paddingBottom: '10px' }}>商品详情</p>
                            <div className="detail-content">
                                我信仰"民生在勤"!因为我也深深地知道，生存的条件就是要勤劳，而"勤则不匮"却是胡说八道!恰恰相反，
                                劳动强度大的人群往往物质最匮乏，当工资不足以养家时，加班加点或身兼数职便成了的选项。
                                这是耶和华在《马泰福音》中制定的铁律:20%的人占据着80%的财富，80%的人为了那20%的资源争夺而挣扎。
                                主说:我要让好的更好，差的更差。这便是"马泰效应"，只要人类存在，这铁律便不会有更张.
                            </div>
                        </div>
                    </>
                )
            }


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
                <div className="bar-item action buy-now">
                    立即购买
                </div>
            </div>

            {/* 弹出框 */}
            {
                showPopup && ShopData && (
                    <div className="popup-overlay">
                        <div className="popup-content">
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
        </div >
    );
};

export default Shoppdetail;