// 订单状态常量
export const OrderStatus = {
    PENDING_PAYMENT: 'pending_payment', // 待付款
    PAID: 'paid',                       // 已付款
    SHIPPED: 'shipped',                 // 已发货
    RECEIVED: 'received',               // 已收货

    CANCELLED: 'cancelled',             // 已取消
    PAYMENT_FAILED: 'payment_failed'    // 支付失败
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

// 订单项接口
export interface OrderItem {
    id: string;
    name: string;
    price: number;
    image: string;
    color: string;
    size: string;
    quantity: number;
}

// 订单接口
export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatusType;
    createTime: string;
    paymentTime?: string;
    shippingTime?: string;
    deliveryTime?: string;
    address: {
        recipient: string;
        phone: string;
        province: string;
        city: string;
        district: string;
        detail: string;
    };
    paymentMethod: string;
    message?: string;
}

// 订单统计接口
export interface OrderStats {
    pending: number;
    processing: number;
    shipped: number;
    completed: number;
}

// 计算订单统计
export const calculateOrderStats = (orders: Order[]): OrderStats => {
    return {
        pending: orders.filter(order => order.status === OrderStatus.PENDING_PAYMENT).length,
        processing: orders.filter(order => order.status === OrderStatus.PAID).length, // 已支付但未发货（待发货）
        shipped: orders.filter(order => order.status === OrderStatus.SHIPPED).length, // 已发货（待收货）
        completed: orders.filter(order => order.status === OrderStatus.RECEIVED).length // 已收货
    };
}; 

 