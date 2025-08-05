// 订单状态常量
export const OrderStatus = {
    PENDING_PAYMENT: 'pending_payment', // 待付款
    PAID: 'paid',                       // 已付款
    SHIPPED: 'shipped',                 // 已发货
    DELIVERED: 'delivered',             // 已送达
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

// 模拟订单数据
export const getMockOrders = (): Order[] => {
    return [
        {
            id: '1',
            orderNumber: 'ORD20241201001',
            userId: 'user123',
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
            totalAmount: 299.00,
            status: OrderStatus.PENDING_PAYMENT,
            createTime: '2024-12-01 10:30:00',
            address: {
                recipient: '张小五',
                phone: '13945678912',
                province: '北京市',
                city: '北京市',
                district: '昌平区',
                detail: '回龙观大街小区31号'
            },
            paymentMethod: '支付宝',
            message: '请尽快发货'
        },
        {
            id: '2',
            orderNumber: 'ORD20241201002',
            userId: 'user123',
            items: [
                {
                    id: 'item2',
                    name: '经典款牛仔裤',
                    price: 199.00,
                    image: '/img/car2.jpg',
                    color: '蓝色',
                    size: 'L',
                    quantity: 2
                }
            ],
            totalAmount: 398.00,
            status: OrderStatus.PAID,
            createTime: '2024-12-01 09:15:00',
            paymentTime: '2024-12-01 09:20:00',
            address: {
                recipient: '张小五',
                phone: '13945678912',
                province: '北京市',
                city: '北京市',
                district: '昌平区',
                detail: '回龙观大街小区31号'
            },
            paymentMethod: '支付宝'
        },
        {
            id: '3',
            orderNumber: 'ORD20241130001',
            userId: 'user123',
            items: [
                {
                    id: 'item3',
                    name: '时尚T恤',
                    price: 89.00,
                    image: '/img/car3.jpg',
                    color: '黑色',
                    size: 'M',
                    quantity: 1
                }
            ],
            totalAmount: 89.00,
            status: OrderStatus.SHIPPED,
            createTime: '2024-11-30 14:20:00',
            paymentTime: '2024-11-30 14:25:00',
            shippingTime: '2024-12-01 08:30:00',
            address: {
                recipient: '张小五',
                phone: '13945678912',
                province: '北京市',
                city: '北京市',
                district: '昌平区',
                detail: '回龙观大街小区31号'
            },
            paymentMethod: '支付宝'
        },
        {
            id: '4',
            orderNumber: 'ORD20241129001',
            userId: 'user123',
            items: [
                {
                    id: 'item4',
                    name: '运动帽',
                    price: 45.00,
                    image: '/img/car4.jpg',
                    color: '红色',
                    size: '均码',
                    quantity: 1
                }
            ],
            totalAmount: 45.00,
            status: OrderStatus.CANCELLED,
            createTime: '2024-11-29 16:45:00',
            address: {
                recipient: '张小五',
                phone: '13945678912',
                province: '北京市',
                city: '北京市',
                district: '昌平区',
                detail: '回龙观大街小区31号'
            },
            paymentMethod: '支付宝',
            message: '颜色不喜欢，取消订单'
        },
        {
            id: '5',
            orderNumber: 'ORD20241128001',
            userId: 'user123',
            items: [
                {
                    id: 'item5',
                    name: '休闲背包',
                    price: 128.00,
                    image: '/img/car5.jpg',
                    color: '灰色',
                    size: '标准',
                    quantity: 1
                }
            ],
            totalAmount: 128.00,
            status: OrderStatus.CANCELLED,
            createTime: '2024-11-28 11:20:00',
            address: {
                recipient: '张小五',
                phone: '13945678912',
                province: '北京市',
                city: '北京市',
                district: '昌平区',
                detail: '回龙观大街小区31号'
            },
            paymentMethod: '支付宝',
            message: '尺寸不合适，取消订单'
        }
    ];
};

// 计算订单统计
export const calculateOrderStats = (orders: Order[]): OrderStats => {
    return {
        pending: orders.filter(order => order.status === OrderStatus.PENDING_PAYMENT).length,
        processing: orders.filter(order => order.status === OrderStatus.PAID).length,
        shipped: orders.filter(order => order.status === OrderStatus.SHIPPED).length,
        completed: orders.filter(order => order.status === OrderStatus.DELIVERED).length
    };
}; 