import React from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerServiceTest: React.FC = () => {
    const navigate = useNavigate();

    const testWithProduct = () => {
        // 模拟商品信息
        const productInfo = {
            name: "测试商品",
            price: 299,
            category: "服装",
            description: "这是一个测试商品的描述",
            colors: ["红色", "蓝色", "黑色"],
            sizes: ["S", "M", "L", "XL"]
        };

        navigate('/ai-customer-service', {
            state: { productInfo }
        });
    };

    const testWithoutProduct = () => {
        navigate('/ai-customer-service');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>智能客服测试页面</h1>
            <p>测试基于Ollama deepseek:r1:7b的智能客服系统</p>
            
            <div style={{ marginTop: '20px' }}>
                <h3>测试选项：</h3>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button 
                        onClick={testWithProduct}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#1677ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        测试带商品信息的客服
                    </button>
                    
                    <button 
                        onClick={testWithoutProduct}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#52c41a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        测试通用客服
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                <h4>使用说明：</h4>
                <ul>
                    <li>确保后端服务已启动（端口3000）</li>
                    <li>确保Ollama服务已启动（端口11434）</li>
                    <li>确保已下载deepseek:r1:7b模型</li>
                    <li>点击上方按钮测试不同场景的智能客服</li>
                </ul>
            </div>

            <div style={{ marginTop: '20px' }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    返回
                </button>
            </div>
        </div>
    );
};

export default CustomerServiceTest; 