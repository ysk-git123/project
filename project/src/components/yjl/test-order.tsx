import React from 'react';
import { useNavigate } from 'react-router-dom';

const TestOrder: React.FC = () => {
    const navigate = useNavigate();

    const testOrderData = {
        orderId: 'test-1',
        orderNumber: 'ORD20241201001',
        items: [
            {
                id: 'item1',
                name: '时尚休闲运动鞋',
                price: 299.00,
                image: '/img/car1.jpg',
                color: '白色',
                size: '42',
                quantity: 1
            }
        ],
        totalAmount: 299.00
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>订单功能测试</h2>
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={() => navigate('/myorder')}
                    style={{ marginRight: '10px', padding: '10px' }}
                >
                    查看我的订单
                </button>
                <button 
                    onClick={() => navigate('/pendingPayment', { state: testOrderData })}
                    style={{ padding: '10px' }}
                >
                    测试待付款页面
                </button>
            </div>
            <div>
                <h3>测试数据：</h3>
                <pre>{JSON.stringify(testOrderData, null, 2)}</pre>
            </div>
        </div>
    );
};

export default TestOrder; 