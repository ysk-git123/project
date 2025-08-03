import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom' // 新增 useLocation
import {
    AppOutline,
    UnorderedListOutline,
    GiftOutline,
    UserOutline
} from 'antd-mobile-icons';

export default function TabBar() {
    return (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px', display: 'flex', background: '#fff', borderTop: '1px solid #eee', zIndex: 100 }}>
            <TabItem label="首页" path="/shou" icon={<AppOutline />} />
            <TabItem label="分类" path="/classify" icon={<UnorderedListOutline />} />
            <TabItem label="购物车" path="/cart" icon={<GiftOutline />} />
            <TabItem label="我的" path="/mine" icon={<UserOutline />} />
        </div>
    )
}

function TabItem({ label, path, icon }: { label: string, path: string, icon: React.ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation(); // 获取当前路由路径
    const isActive = location.pathname === path; // 判断是否为当前活跃标签

    return (
        <div
            style={{
                flex: 1,
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: isActive ? '#1677ff' : '#333' // 文字高亮颜色（示例用antd默认蓝）
            }}
            onClick={() => navigate(path)}
        >
            <div style={{
                fontSize: '20px',
                marginBottom: '2px',
                color: isActive ? '#1677ff' : '#333' // 图标高亮颜色
            }}>
                {icon}
            </div>
            <div style={{ fontSize: '12px' }}>
                {label}
            </div>
        </div>
    );
}