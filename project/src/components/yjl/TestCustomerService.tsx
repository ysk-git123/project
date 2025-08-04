import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TestCustomerService: React.FC = () => {
    const navigate = useNavigate();
    const [testResult, setTestResult] = useState<string>('');

    const testBackendHealth = async () => {
        try {
            const response = await fetch('/YJL/health');
            const data = await response.json();
            setTestResult(`✅ 后端健康检查成功: ${data.message}`);
        } catch (error) {
            setTestResult(`❌ 后端健康检查失败: ${error}`);
        }
    };

    const testOllamaConnection = async () => {
        try {
            const response = await fetch('http://localhost:11434/api/tags');
            const data = await response.json();
            setTestResult(`✅ Ollama连接成功，可用模型: ${data.models?.map((m: any) => m.name).join(', ')}`);
        } catch (error) {
            setTestResult(`❌ Ollama连接失败: ${error}`);
        }
    };

    const testCustomerService = () => {
        navigate('/ai-customer-service');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>智能客服系统测试</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <h3>系统状态检查</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button 
                        onClick={testBackendHealth}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        测试后端连接
                    </button>
                    <button 
                        onClick={testOllamaConnection}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        测试Ollama连接
                    </button>
                </div>
                {testResult && (
                    <div style={{ 
                        padding: '10px', 
                        backgroundColor: testResult.includes('✅') ? '#d4edda' : '#f8d7da',
                        border: `1px solid ${testResult.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
                        borderRadius: '5px',
                        marginTop: '10px'
                    }}>
                        {testResult}
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>功能测试</h3>
                <button 
                    onClick={testCustomerService}
                    style={{
                        padding: '15px 30px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    启动智能客服
                </button>
            </div>

            <div style={{ 
                padding: '15px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                marginTop: '20px'
            }}>
                <h4>使用说明：</h4>
                <ul>
                    <li>确保后端服务已启动（端口3000）</li>
                    <li>确保Ollama服务已启动（端口11434）</li>
                    <li>确保已下载deepseek-r1:7b模型</li>
                    <li>点击上方按钮测试系统状态</li>
                    <li>点击"启动智能客服"进入客服界面</li>
                </ul>
            </div>

            <div style={{ marginTop: '20px' }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    返回
                </button>
            </div>
        </div>
    );
};

export default TestCustomerService; 