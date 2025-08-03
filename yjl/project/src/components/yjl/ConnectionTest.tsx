import React, { useState } from 'react';
import { Button, Space, Toast } from 'antd-mobile';
import { POST, GET, DELETE } from '../../Axios/api';

const ConnectionTest: React.FC = () => {
    const [loading, setLoading] = useState<string | null>(null);

    const runTest = async (testName: string, testFn: () => Promise<any>) => {
        setLoading(testName);
        try {
            const result = await testFn();
            Toast.show({
                content: `${testName}成功: ${JSON.stringify(result.data)}`,
                position: 'top',
            });
        } catch (error: any) {
            Toast.show({
                content: `${testName}失败: ${error.message}`,
                position: 'top',
            });
        } finally {
            setLoading(null);
        }
    };

    // 测试GET请求
    const testGetRequest = () => runTest('GET请求', () => GET('/YJL/health'));

    // 测试POST请求
    const testPostRequest = () => runTest('POST请求', () => POST('/YJL/chat', { message: 'test' }));

    // 测试智能客服聊天
    const testCustomerService = () => runTest('智能客服聊天', () => POST('/YJL/chat', { 
        message: '你好，请介绍一下你们的产品', 
        sessionId: 'test_session' 
    }));

    // 测试获取聊天历史
    const testChatHistory = () => runTest('获取聊天历史', () => GET('/YJL/chat/history/test_session'));

    // 测试获取会话列表
    const testSessions = () => runTest('获取会话列表', () => GET('/YJL/chat/sessions'));

    return (
        <div style={{ padding: '20px' }}>
            <h2>连接测试</h2>
            <p>测试与后端服务器的连接状态</p>
            
            <Space direction="vertical" style={{ width: '100%', marginTop: '20px' }}>
                <Button 
                    color="primary" 
                    onClick={testGetRequest}
                    loading={loading === 'GET请求'}
                    block
                >
                    测试GET请求
                </Button>
                
                <Button 
                    color="success" 
                    onClick={testPostRequest}
                    loading={loading === 'POST请求'}
                    block
                >
                    测试POST请求
                </Button>
                
                <Button 
                    color="primary" 
                    onClick={testCustomerService}
                    loading={loading === '智能客服聊天'}
                    block
                >
                    测试智能客服聊天
                </Button>
                
                <Button 
                    color="success" 
                    onClick={testChatHistory}
                    loading={loading === '获取聊天历史'}
                    block
                >
                    测试获取聊天历史
                </Button>
                
                <Button 
                    color="warning" 
                    onClick={testSessions}
                    loading={loading === '获取会话列表'}
                    block
                >
                    测试获取会话列表
                </Button>
            </Space>
            
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                <h4>使用说明：</h4>
                <ul>
                    <li>确保后端服务已启动（端口3000）</li>
                    <li>确保Ollama服务已启动（端口11434）</li>
                    <li>确保已下载deepseek:r1:7b模型</li>
                    <li>点击上方按钮测试不同功能</li>
                </ul>
            </div>
        </div>
    );
};

export default ConnectionTest; 