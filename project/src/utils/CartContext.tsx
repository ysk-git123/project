import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import TokenManager from './tokenManager';

// 定义购物车商品类型
export interface CartItem {
    productId: string; // 改为productId以匹配后端数据结构
    name: string;
    price: number;
    image: string;
    color: string;
    size: string;
    quantity: number;
}

// 生成购物车商品唯一标识
export const getCartItemKey = (item: CartItem): string => {
    return `${item.productId}-${item.color}-${item.size}`;
};

// 购物车状态类型
interface CartState {
    items: CartItem[];
    loading: boolean;
    error: string | null;
}

// 购物车操作类型
type CartAction = 
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_CART_ITEMS'; payload: CartItem[] }
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { itemKey: string; quantity: number } }
    | { type: 'CLEAR_CART' };

// 初始状态
const initialState: CartState = {
    items: [],
    loading: false,
    error: null
};

// Reducer函数
const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_CART_ITEMS':
            return { ...state, items: action.payload };
        case 'ADD_ITEM': {
            const itemKey = getCartItemKey(action.payload);
            const existingItem = state.items.find(
                item => getCartItemKey(item) === itemKey
            );
            
            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map(item =>
                        getCartItemKey(item) === itemKey
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    )
                };
            } else {
                return {
                    ...state,
                    items: [...state.items, action.payload]
                };
            }
        }
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => getCartItemKey(item) !== action.payload)
            };
        case 'UPDATE_QUANTITY': {
            const { itemKey, quantity } = action.payload;
            return {
                ...state,
                items: state.items.map(item =>
                    getCartItemKey(item) === itemKey
                        ? { ...item, quantity }
                        : item
                )
            };
        }
        case 'CLEAR_CART':
            return { ...state, items: [] };
        default:
            return state;
    }
};

// Context类型
interface CartContextType {
    state: CartState;
    loadCart: () => Promise<void>;
    addItem: (item: CartItem) => Promise<void>;
    removeItem: (itemKey: string) => Promise<void>;
    updateQuantity: (itemKey: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

// 创建Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider组件
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const currentUserIdRef = useRef<string | null>(null);

    // 获取当前用户信息
    const getCurrentUser = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (error) {
                console.error('解析用户信息失败:', error);
                return null;
            }
        }
        return null;
    };

    // 监听用户变化
    const checkUserChange = () => {
        const currentUser = getCurrentUser();
        const currentUserId = currentUser?.id;
        
        // 如果用户ID发生变化，清空购物车并重新加载
        if (currentUserId !== currentUserIdRef.current) {
            dispatch({ type: 'SET_CART_ITEMS', payload: [] });
            dispatch({ type: 'SET_ERROR', payload: null });
            currentUserIdRef.current = currentUserId;
            
            // 如果有新用户登录，加载新用户的购物车
            if (currentUserId) {
                loadCart();
            }
        }
    };

    // 加载购物车数据
    const loadCart = async () => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.warn('用户未登录，无法加载购物车');
            return;
        }

        // 检查token是否过期，如果过期则先刷新
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken && TokenManager.isTokenExpired(accessToken)) {
            const refreshResult = await refreshToken();
            if (!refreshResult) {
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return;
            }
        }

        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        try {
            const response = await fetch('http://localhost:3000/YSK/cart', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (response.status === 401) {
                const errorData = await response.json();
                if (errorData.code === 'TOKEN_EXPIRED') {
                    // 尝试刷新Token
                    const refreshResult = await refreshToken();
                    if (refreshResult) {
                        // 刷新成功，重新加载购物车
                        await loadCart();
                        return;
                    } else {
                        // 刷新失败，跳转到登录页
                        localStorage.removeItem('user');
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/login';
                        return;
                    }
                }
            }

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    dispatch({ type: 'SET_CART_ITEMS', payload: result.data });
                } else {
                    dispatch({ type: 'SET_ERROR', payload: result.message || '加载购物车失败' });
                }
            } else {
                dispatch({ type: 'SET_ERROR', payload: '网络请求失败' });
            }
        } catch (error: any) {
            console.error('加载购物车失败:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message || '网络错误' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // Token刷新函数
    const refreshToken = async (): Promise<boolean> => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                return false;
            }

            const response = await fetch('http://localhost:3000/YSK/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    localStorage.setItem('accessToken', result.data.accessToken);
                    localStorage.setItem('refreshToken', result.data.refreshToken);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Token刷新失败:', error);
            return false;
        }
    };

    // 添加商品到购物车
    const addItem = async (item: CartItem) => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.warn('用户未登录，无法添加商品到购物车');
            return;
        }

        // 检查token是否过期，如果过期则先刷新
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken && TokenManager.isTokenExpired(accessToken)) {
            const refreshResult = await refreshToken();
            if (!refreshResult) {
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return;
            }
        }

        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        try {
            const response = await fetch('http://localhost:3000/YSK/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    color: item.color,
                    size: item.size,
                    quantity: item.quantity
                })
            });
            
            if (response.status === 401) {
                const errorData = await response.json();
                if (errorData.code === 'TOKEN_EXPIRED') {
                    const refreshResult = await refreshToken();
                    if (refreshResult) {
                        await addItem(item);
                        return;
                    } else {
                        localStorage.removeItem('user');
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/login';
                        return;
                    }
                }
            }
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    dispatch({ type: 'SET_CART_ITEMS', payload: result.data });
                } else {
                    dispatch({ type: 'SET_ERROR', payload: result.message || '添加商品失败' });
                }
            } else {
                dispatch({ type: 'SET_ERROR', payload: '网络请求失败' });
            }
        } catch (error: any) {
            console.error('添加商品失败:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message || '网络错误' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // 删除购物车商品
    const removeItem = async (itemKey: string) => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.warn('用户未登录，无法删除购物车商品');
            throw new Error('用户未登录');
        }

        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        try {
            const item = state.items.find(item => getCartItemKey(item) === itemKey);
            
            if (!item) {
                console.error('CartContext: 商品不存在，itemKey:', itemKey);
                dispatch({ type: 'SET_ERROR', payload: '商品不存在' });
                throw new Error('商品不存在');
            }

            const requestBody = {
                productId: item.productId,
                color: item.color,
                size: item.size
            };

            const response = await fetch('http://localhost:3000/YSK/cart/remove', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(requestBody)
            });
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    dispatch({ type: 'SET_CART_ITEMS', payload: result.data });
                } else {
                    console.error('CartContext: 删除失败，服务器返回错误:', result.message);
                    dispatch({ type: 'SET_ERROR', payload: result.message || '删除商品失败' });
                    throw new Error(result.message || '删除商品失败');
                }
            } else {
                console.error('CartContext: 删除请求失败，状态码:', response.status);
                dispatch({ type: 'SET_ERROR', payload: '网络请求失败' });
                throw new Error('网络请求失败');
            }
        } catch (error: any) {
            console.error('CartContext: 删除商品失败:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message || '网络错误' });
            throw error; // 重新抛出错误，让调用者知道删除失败
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // 更新商品数量
    const updateQuantity = async (itemKey: string, quantity: number) => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.warn('用户未登录，无法更新商品数量');
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        try {
            const item = state.items.find(item => getCartItemKey(item) === itemKey);
            
            if (!item) {
                dispatch({ type: 'SET_ERROR', payload: '商品不存在' });
                return;
            }

            const response = await fetch('http://localhost:3000/YSK/cart/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    productId: item.productId,
                    color: item.color,
                    size: item.size,
                    quantity
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    dispatch({ type: 'SET_CART_ITEMS', payload: result.data });
                } else {
                    dispatch({ type: 'SET_ERROR', payload: result.message || '更新数量失败' });
                }
            } else {
                dispatch({ type: 'SET_ERROR', payload: '网络请求失败' });
            }
        } catch (error: any) {
            console.error('更新数量失败:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message || '网络错误' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // 清空购物车
    const clearCart = async () => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.warn('用户未登录，无法清空购物车');
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        try {
            const response = await fetch('http://localhost:3000/YSK/cart/clear', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    dispatch({ type: 'SET_CART_ITEMS', payload: result.data });
                } else {
                    dispatch({ type: 'SET_ERROR', payload: result.message || '清空购物车失败' });
                }
            } else {
                dispatch({ type: 'SET_ERROR', payload: '网络请求失败' });
            }
        } catch (error: any) {
            console.error('清空购物车失败:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message || '网络错误' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const getTotalItems = () => {
        return state.items.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // 组件挂载时初始化
    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            currentUserIdRef.current = currentUser.id;
            loadCart();
        }
    }, []);

    // 定期检查用户变化
    useEffect(() => {
        const interval = setInterval(checkUserChange, 1000); // 每秒检查一次
        return () => clearInterval(interval);
    }, []);

    // 监听localStorage变化
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'user' && e.newValue !== e.oldValue) {
                // 用户切换检测到，清空购物车数据
                dispatch({ type: 'SET_CART_ITEMS', payload: [] });
                dispatch({ type: 'SET_ERROR', payload: null });
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <CartContext.Provider value={{
            state,
            loadCart,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            getTotalItems,
            getTotalPrice
        }}>
            {children}
        </CartContext.Provider>
    );
};

// 自定义Hook
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 