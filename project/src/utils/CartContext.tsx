import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

// 定义购物车商品类型
export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    color: string;
    size: string;
    quantity: number;
}

// 生成购物车商品唯一标识
export const getCartItemKey = (item: CartItem): string => {
    return `${item.id}-${item.color}-${item.size}`;
};

// 购物车状态类型
interface CartState {
    items: CartItem[];
}

// 购物车操作类型
type CartAction = 
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'REMOVE_ITEM'; payload: string } // 现在传递完整的itemKey
    | { type: 'UPDATE_QUANTITY'; payload: { itemKey: string; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'LOAD_CART'; payload: CartItem[] };

// 本地存储键名
const CART_STORAGE_KEY = 'shopping_cart';

// 从本地存储加载购物车数据
const loadCartFromStorage = (): CartItem[] => {
    try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
        console.error('Failed to load cart from storage:', error);
        return [];
    }
};

// 保存购物车数据到本地存储
const saveCartToStorage = (items: CartItem[]): void => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.error('Failed to save cart to storage:', error);
    }
};

// 初始状态
const initialState: CartState = {
    items: loadCartFromStorage()
};

// Reducer函数
const cartReducer = (state: CartState, action: CartAction): CartState => {
    let newState: CartState;
    
    switch (action.type) {
        case 'ADD_ITEM': {
            const itemKey = getCartItemKey(action.payload);
            const existingItem = state.items.find(
                item => getCartItemKey(item) === itemKey
            );
            
            if (existingItem) {
                newState = {
                    ...state,
                    items: state.items.map(item =>
                        getCartItemKey(item) === itemKey
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    )
                };
            } else {
                newState = {
                    ...state,
                    items: [...state.items, action.payload]
                };
            }
            break;
        }
        case 'REMOVE_ITEM': {
            // 删除指定itemKey的商品
            newState = {
                ...state,
                items: state.items.filter(item => getCartItemKey(item) !== action.payload)
            };
            break;
        }
        case 'UPDATE_QUANTITY': {
            // 更新指定itemKey的商品数量
            const { itemKey, quantity } = action.payload;
            newState = {
                ...state,
                items: state.items.map(item =>
                    getCartItemKey(item) === itemKey
                        ? { ...item, quantity }
                        : item
                )
            };
            break;
        }
        case 'CLEAR_CART': {
            newState = {
                ...state,
                items: []
            };
            break;
        }
        case 'LOAD_CART': {
            newState = {
                ...state,
                items: action.payload
            };
            break;
        }
        default:
            return state;
    }
    
    // 保存到本地存储
    saveCartToStorage(newState.items);
    return newState;
};

// Context类型
interface CartContextType {
    state: CartState;
    addItem: (item: CartItem) => void;
    removeItem: (itemKey: string) => void;
    updateQuantity: (itemKey: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

// 创建Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider组件
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // 组件挂载时从本地存储加载数据
    useEffect(() => {
        const savedCart = loadCartFromStorage();
        if (savedCart.length > 0) {
            dispatch({ type: 'LOAD_CART', payload: savedCart });
        }
    }, []);

    const addItem = (item: CartItem) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
    };

    const removeItem = (itemKey: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: itemKey });
    };

    const updateQuantity = (itemKey: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { itemKey, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const getTotalItems = () => {
        return state.items.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <CartContext.Provider value={{
            state,
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