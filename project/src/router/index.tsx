import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '../components/YSK/Login'
import Shou from '../components/YSK/Shou'
import CategoryPage from '../components/YSK/CategoryPage'

import IsLogin from '../utils/islogin'


// 杨佳乐
import Shoppdetail from '../components/yjl/shoppdetail'
import Shopping from '../components/yjl/shopping'
import Cart from '../components/yjl/cart'


const router = createBrowserRouter([
    {
        path: '/login',                                 // 登录
        element: <Login />
    },
    {
        path: '/category/:category',                     // 分类
        element: <IsLogin><CategoryPage /></IsLogin>
    },
    {
        path: '/shoppdetail',                            // 商品详情
        element: <Shoppdetail />
    },
    {
        path: '/shopping',                               // 订单
        element: <Shopping />
    },
    {
        path: '/shou',                                   // 首页
        element: <IsLogin><Shou /></IsLogin>
    },
    {
        path: '/',                                       // 根路径重定向到首页
        element: <Navigate to="/login" replace />
    },
    {
        path: '/cart',                                   // 购物车
        element: <Cart />
    }
])

export default router