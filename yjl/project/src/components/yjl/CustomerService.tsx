import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GET, DELETE } from '../../Axios/api';
import './CustomerService.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface Session {
    sessionId: string;
    lastMessage: string;
    updatedAt: Date;
}

interface ProductInfo {
    name?: string;
    price?: number;
    category?: string;
    description?: string;
    colors?: string[];
    sizes?: string[];
}

const CustomerService: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const productInfo: ProductInfo = location.state?.productInfo || {};
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState('default');
    const [sessions, setSessions] = useState<Session[]>([]);
    const [showSessions, setShowSessions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // 自动滚动到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 加载聊天历史
    const loadChatHistory = async (sessionId: string) => {
        try {
            const response = await GET(`/YJL/chat/history/${sessionId}`);
            if (response.messages) {
                setMessages(response.messages.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                })));
            }
        } catch (error) {
            console.error('加载聊天历史失败:', error);
        }
    };

    // 加载会话列表
    const loadSessions = async () => {
        try {
            const response = await GET('/YJL/chat/sessions');
            setSessions(response.sessions || []);
        } catch (error) {
            console.error('加载会话列表失败:', error);
        }
    };

    useEffect(() => {
        loadChatHistory(sessionId);
        loadSessions();
    }, [sessionId]);

    // 发送消息
    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // 创建新的会话ID（如果还没有的话）
            const currentSessionId = sessionId === 'default' ? `session_${Date.now()}` : sessionId;
            if (sessionId === 'default') {
                setSessionId(currentSessionId);
            }

            // 添加空的助手消息占位符
            const assistantMessage: Message = {
                role: 'assistant',
                content: '',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);

            // 创建AbortController用于取消请求
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, 300000); // 增加到300秒(5分钟)超时

            // 发送流式请求
            const response = await fetch('/YJL/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    sessionId: currentSessionId,
                    productInfo: productInfo // 传递商品信息
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`网络请求失败: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('无法读取响应流');
            }

            let assistantResponse = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = new TextDecoder().decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            
                            if (data === '[DONE]') {
                                setIsLoading(false);
                                loadSessions(); // 刷新会话列表
                                return;
                            }

                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.error) {
                                    // 处理错误响应
                                    setMessages(prev => {
                                        const newMessages = [...prev];
                                        const lastMessage = newMessages[newMessages.length - 1];
                                        if (lastMessage && lastMessage.role === 'assistant') {
                                            lastMessage.content = `错误: ${parsed.error}`;
                                        }
                                        return newMessages;
                                    });
                                    setIsLoading(false);
                                    return;
                                }
                                
                                if (parsed.content) {
                                    assistantResponse += parsed.content;
                                    setMessages(prev => {
                                        const newMessages = [...prev];
                                        const lastMessage = newMessages[newMessages.length - 1];
                                        if (lastMessage && lastMessage.role === 'assistant') {
                                            lastMessage.content = assistantResponse;
                                        }
                                        return newMessages;
                                    });
                                }
                            } catch (parseError) {
                                console.error('解析响应失败:', parseError);
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
        } catch (error: any) {
            console.error('发送消息失败:', error);
            
            let errorMessage = '发送消息失败，请重试';
            if (error.name === 'AbortError') {
                errorMessage = '请求超时(5分钟)，AI模型可能在处理复杂问题，请稍后重试或尝试简化问题';
            } else if (error.message?.includes('Failed to fetch')) {
                errorMessage = '无法连接到服务器，请检查网络连接或确保后端服务已启动';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            // 更新最后一条助手消息为错误信息
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = errorMessage;
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 清除聊天历史
    const clearHistory = async () => {
        const result = confirm('确定要清除当前会话的聊天记录吗？');
        
        if (result) {
            try {
                await DELETE(`/YJL/chat/history/${sessionId}`);
                setMessages([]);
                alert('聊天记录已清除');
            } catch (error) {
                alert('清除失败，请重试');
            }
        }
    };

    // 切换会话
    const switchSession = (newSessionId: string) => {
        setSessionId(newSessionId);
        setShowSessions(false);
    };

    // 创建新会话
    const createNewSession = () => {
        const newSessionId = `session_${Date.now()}`;
        setSessionId(newSessionId);
        setMessages([]);
        setShowSessions(false);
    };

    // 处理回车键发送消息
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="customer-service">
            {/* 头部导航栏 */}
            <div className="customer-service-nav-header">
                <div className="nav-back-btn" onClick={() => navigate(-1)}>
                    返回
                </div>
                <div className="nav-title">客服</div>
                <div className="nav-placeholder"></div>
            </div>

            {/* 功能按钮区域 */}
            <div className="customer-service-header">
                <div className="header-title">智能客服</div>
                <div className="header-actions">
                    <button 
                        className="header-btn"
                        onClick={() => setShowSessions(true)}
                        title="聊天记录"
                    >
                        📋
                    </button>
                    <button 
                        className="header-btn"
                        onClick={clearHistory}
                        title="清除记录"
                    >
                        🗑️
                    </button>
                </div>
            </div>

            {/* 聊天消息区域 */}
            <div className="chat-container" ref={chatContainerRef}>
                <div className="messages">
                    {messages.length === 0 && (
                        <div className="welcome-message">
                            <div className="welcome-icon">🤖</div>
                            <h3>欢迎使用智能客服</h3>
                            {productInfo.name ? (
                                <div>
                                    <p>我正在为您服务，当前商品信息：</p>
                                    <div className="product-info-card">
                                        <h4>{productInfo.name}</h4>
                                        <p>价格: ¥{productInfo.price}</p>
                                        <p>分类: {productInfo.category}</p>
                                        {productInfo.colors && (
                                            <p>颜色: {productInfo.colors.join(', ')}</p>
                                        )}
                                        {productInfo.sizes && (
                                            <p>尺码: {productInfo.sizes.join(', ')}</p>
                                        )}
                                    </div>
                                    <p>我可以帮您解答关于此商品的问题，提供购买建议等服务</p>
                                </div>
                            ) : (
                                <p>我可以帮您解答购物相关问题，提供产品推荐等服务</p>
                            )}
                        </div>
                    )}
                    
                    {messages.map((message, index) => (
                        <div 
                            key={index} 
                            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                        >
                            <div className="message-avatar">
                                {message.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className="message-content">
                                <div className="message-text">{message.content}</div>
                                <div className="message-time">
                                    {message.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="message assistant-message">
                            <div className="message-avatar">🤖</div>
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* 输入区域 */}
            <div className="input-container">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="请输入您的问题..."
                    disabled={isLoading}
                    className="message-input"
                />
                <button
                    className="send-button"
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isLoading}
                >
                    发送
                </button>
            </div>

            {/* 会话列表弹窗 */}
            {showSessions && (
                <div className="sessions-overlay" onClick={() => setShowSessions(false)}>
                    <div className="sessions-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="sessions-header">
                            <button 
                                className="back-btn"
                                onClick={() => setShowSessions(false)}
                            >
                                ← 返回
                            </button>
                            <h3>聊天记录</h3>
                            <button 
                                className="new-session-btn"
                                onClick={createNewSession}
                            >
                                新建
                            </button>
                        </div>
                        
                        <div className="sessions-list">
                            {sessions.map((session) => (
                                <div
                                    key={session.sessionId}
                                    className={`session-item ${session.sessionId === sessionId ? 'active' : ''}`}
                                    onClick={() => switchSession(session.sessionId)}
                                >
                                    <div className="session-title">
                                        会话 {session.sessionId}
                                    </div>
                                    <div className="session-preview">
                                        {session.lastMessage || '暂无消息'}
                                    </div>
                                    <div className="session-time">
                                        {new Date(session.updatedAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                            
                            {sessions.length === 0 && (
                                <div className="empty-sessions">
                                    <p>暂无聊天记录</p>
                                    <button 
                                        className="start-chat-btn"
                                        onClick={createNewSession}
                                    >
                                        开始新对话
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerService; 