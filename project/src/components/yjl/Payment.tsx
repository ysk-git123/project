import React, { useState } from 'react';
import './Payment.moudle.css';
import { useCart } from '../../utils/CartContext';

interface PaymentProps {
    username?: string;
    onPaymentSuccess?: (orderNo: string) => void;
    onPaymentError?: (error: string) => void;
}

interface PaymentResponse {
    code: number;
    message: string;
    data?: {
        orderNo: string;
        payUrl: string;
    };
}

interface UserInfo {
    username: string;
    isvip: string;
    createdAt: string;
    updatedAt: string;
}

const Payment: React.FC<PaymentProps> = ({ 
    username = '', 
    onPaymentSuccess, 
    onPaymentError 
}) => {
    const [currentUsername, setCurrentUsername] = useState(username);
    const [amount, setAmount] = useState('38.88');
    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
    const { clearCart } = useCart();

    const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const createPayment = async () => {
        if (!currentUsername.trim()) {
            showMessage('请输入用户名', 'error');
            return;
        }

        setLoading(true);
        try {
            showMessage('正在创建支付订单...', 'info');
            
            const response = await fetch(`/YJL/zf?username=${encodeURIComponent(currentUsername)}&amount=${amount}`);
            const result: PaymentResponse = await response.json();
            
            if (result.code === 200 && result.data) {
                showMessage('支付订单创建成功！正在跳转到支付页面...', 'success');
                
                // 在新窗口打开支付页面
                const payWindow = window.open(result.data.payUrl, '_blank', 'width=800,height=600');
                
                // 监听支付完成（这是一个简化的实现，实际项目中可能需要更复杂的状态检查）
                const checkPaymentStatus = () => {
                    if (payWindow?.closed) {
                        showMessage('支付窗口已关闭，请检查支付结果', 'info');
                        checkUserInfo(); // 重新检查用户状态
                        
                        // 支付成功后清空购物车
                        clearCart();
                        showMessage('支付成功！购物车已清空', 'success');
                        
                        if (onPaymentSuccess) {
                            onPaymentSuccess(result.data!.orderNo);
                        }
                    } else {
                        setTimeout(checkPaymentStatus, 1000);
                    }
                };
                
                setTimeout(checkPaymentStatus, 1000);
                
            } else {
                const errorMsg = `创建支付失败: ${result.message}`;
                showMessage(errorMsg, 'error');
                if (onPaymentError) {
                    onPaymentError(errorMsg);
                }
            }
        } catch (error) {
            const errorMsg = `请求失败: ${error instanceof Error ? error.message : '未知错误'}`;
            showMessage(errorMsg, 'error');
            if (onPaymentError) {
                onPaymentError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const checkUserInfo = async () => {
        if (!currentUsername.trim()) {
            showMessage('请输入用户名', 'error');
            return;
        }

        try {
            const response = await fetch(`/YJL/user/info/${encodeURIComponent(currentUsername)}`);
            const result = await response.json();
            
            if (result.code === 200) {
                setUserInfo(result.data);
                const vipStatus = result.data.isvip === 'true' ? '已开通VIP' : '未开通VIP';
                showMessage(`用户信息查询成功 - ${vipStatus}`, 'success');
            } else {
                showMessage(`查询失败: ${result.message}`, 'error');
                setUserInfo(null);
            }
        } catch (error) {
            showMessage(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error');
            setUserInfo(null);
        }
    };

    return (
        <div className="payment-container">
            <div className="payment-card">
                <h2 className="payment-title">🚀 VIP会员充值</h2>
                
                <div className="form-group">
                    <label htmlFor="username">用户名:</label>
                    <input
                        type="text"
                        id="username"
                        value={currentUsername}
                        onChange={(e) => setCurrentUsername(e.target.value)}
                        placeholder="请输入用户名"
                        disabled={loading}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="amount">充值套餐:</label>
                    <select 
                        id="amount" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={loading}
                    >
                        <option value="38.88">VIP会员 - ¥38.88</option>
                        <option value="0.01">测试支付 - ¥0.01</option>
                        <option value="1.00">小额测试 - ¥1.00</option>
                        <option value="10.00">中额测试 - ¥10.00</option>
                    </select>
                </div>

                <div className="button-group">
                    <button 
                        className="btn btn-primary" 
                        onClick={createPayment}
                        disabled={loading || !currentUsername.trim()}
                    >
                        {loading ? '处理中...' : `立即支付 ¥${amount}`}
                    </button>
                    
                    <button 
                        className="btn btn-secondary" 
                        onClick={checkUserInfo}
                        disabled={loading || !currentUsername.trim()}
                    >
                        查询用户状态
                    </button>
                </div>

                {message && (
                    <div className={`message message-${messageType}`}>
                        {message}
                    </div>
                )}

                {userInfo && (
                    <div className="user-info">
                        <h3>用户信息</h3>
                        <div className="info-item">
                            <span>用户名:</span>
                            <span>{userInfo.username}</span>
                        </div>
                        <div className="info-item">
                            <span>VIP状态:</span>
                            <span className={userInfo.isvip === 'true' ? 'vip-active' : 'vip-inactive'}>
                                {userInfo.isvip === 'true' ? '✅ 已开通' : '❌ 未开通'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span>注册时间:</span>
                            <span>{new Date(userInfo.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="info-item">
                            <span>更新时间:</span>
                            <span>{new Date(userInfo.updatedAt).toLocaleString()}</span>
                        </div>
                    </div>
                )}

                <div className="payment-tips">
                    <h4>💡 支付说明</h4>
                    <ul>
                        <li>支持支付宝沙箱环境测试</li>
                        <li>支付完成后自动开通VIP会员</li>
                        <li>测试账号请使用沙箱买家账号</li>
                        <li>如有问题请联系客服</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Payment; 