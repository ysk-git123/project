import React, { useState } from 'react';
import {
    List,
    Avatar,
    Button,
    Card,
    Tag,
    Toast
} from 'antd-mobile';
import {
    UnorderedListOutline,
    PayCircleOutline,
    GiftOutline,
    SetOutline,
    RightOutline,
    LocationOutline,
    MessageOutline,
    HeartOutline,
    TruckOutline,
    SearchOutline
} from 'antd-mobile-icons';
import styles from './ModuleCSS/Mine.module.css'
import TabBar from './TabBar';

interface UserInfo {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    level: string;
    points: number;
}

interface OrderStats {
    pending: number;
    processing: number;
    shipped: number;
    completed: number;
}


export default function Mine() {
    const [userInfo] = useState<UserInfo>({
        id: '1',
        name: '张三',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        phone: '138****8888',
        level: 'VIP会员',
        points: 2580
    });

    const [orderStats] = useState<OrderStats>({
        pending: 2,
        processing: 1,
        shipped: 3,
        completed: 15
    });

    const menuItems = [
        {
            title: '我的订单',
            icon: <UnorderedListOutline />,
            badge: orderStats.pending + orderStats.processing + orderStats.shipped,
            onClick: () => Toast.show('跳转到订单页面')
        },
        {
            title: '待付款',
            icon: <PayCircleOutline />,
            badge: orderStats.pending,
            onClick: () => Toast.show('跳转到待付款页面')
        },
        {
            title: '待发货',
            icon: <TruckOutline />,
            badge: orderStats.processing,
            onClick: () => Toast.show('跳转到待发货页面')
        },
        {
            title: '待收货',
            icon: <GiftOutline />,
            badge: orderStats.shipped,
            onClick: () => Toast.show('跳转到待收货页面')
        }
    ];

    const serviceItems = [
        {
            title: '收货地址',
            icon: <LocationOutline />,
            onClick: () => Toast.show('跳转到地址管理')
        },
        {
            title: '我的收藏',
            icon: <HeartOutline />,
            onClick: () => Toast.show('跳转到收藏页面')
        },
        {
            title: '客服中心',
            icon: <SearchOutline />,
            onClick: () => Toast.show('跳转到客服页面')
        },
        {
            title: '意见反馈',
            icon: <MessageOutline />,
            onClick: () => Toast.show('跳转到反馈页面')
        }
    ];

    const settingItems = [
        {
            title: '账户设置',
            icon: <SetOutline />,
            onClick: () => Toast.show('跳转到账户设置')
        },
        {
            title: '隐私设置',
            icon: <SetOutline />,
            onClick: () => Toast.show('跳转到隐私设置')
        }
    ];

    return (
        <div className={styles.mineContainer}>
            {/* 用户信息卡片 */}
            <Card className={styles.userCard}>
                <div className={styles.userInfo}>
                    <Avatar
                        src={userInfo.avatar}
                        className={styles.avatar}
                    />
                    <div className={styles.userDetails}>
                        <div className={styles.userName}>{userInfo.name}</div>
                        <div className={styles.userPhone}>{userInfo.phone}</div>
                        <div className={styles.userLevel}>
                            <Tag color='primary'>{userInfo.level}</Tag>
                            <span className={styles.points}>积分: {userInfo.points}</span>
                        </div>
                    </div>
                    <Button
                        size='small'
                        className={styles.editBtn}
                        onClick={() => {
                            Toast.show('编辑个人信息');
                        }}
                    >
                        编辑
                    </Button>
                </div>
            </Card>

            {/* 订单统计 */}
            <Card className={styles.orderCard}>
                <div className={styles.orderHeader}>
                    <span className={styles.orderTitle}>我的订单</span>
                    <div className={styles.orderMore}>
                        <span>查看全部</span>
                        <RightOutline />
                    </div>
                </div>
                <div className={styles.orderStats}>
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            className={styles.orderItem}
                            onClick={item.onClick}
                        >
                            <div className={styles.orderIcon}>
                                {item.icon}
                                {item.badge > 0 && (
                                    <span className={styles.badge}>{item.badge}</span>
                                )}
                            </div>
                            <span className={styles.orderText}>{item.title}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* 服务功能 */}
            <Card className={styles.serviceCard}>
                <div className={styles.serviceHeader}>
                    <span className={styles.serviceTitle}>服务功能</span>
                </div>
                <div className={styles.serviceGrid}>
                    {serviceItems.map((item, index) => (
                        <div
                            key={index}
                            className={styles.serviceItem}
                            onClick={item.onClick}
                        >
                            <div className={styles.serviceIcon}>{item.icon}</div>
                            <span className={styles.serviceText}>{item.title}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* 设置选项 */}
            <Card className={styles.settingCard}>
                <List>
                    {settingItems.map((item, index) => (
                        <List.Item
                            key={index}
                            prefix={item.icon}
                            onClick={item.onClick}
                            arrow={<RightOutline />}
                        >
                            {item.title}
                        </List.Item>
                    ))}
                </List>
            </Card>

            {/* 退出登录 */}
            <div className={styles.logoutContainer}>
                <Button
                    block
                    color='danger'
                    className={styles.logoutBtn}
                    onClick={() => {
                        Toast.show('退出登录');
                    }}
                >
                    退出登录
                </Button>
            </div>
            <TabBar />
        </div>
    );
}
