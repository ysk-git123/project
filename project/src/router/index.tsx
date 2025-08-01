import { createBrowserRouter } from 'react-router-dom'
import Login from '../components/YSK/Login'
import Shou from '../components/YSK/Shou'
import CategoryPage from '../components/YSK/CategoryPage'

import IsLogin from '../utils/islogin'


// 杨佳乐
import Shoppdetail from '../components/YJL/shoppdetail'
import Shopping from '../components/YJL/shopping'


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
        path: '/',                                        // 首页
        element: <IsLogin><Shou /></IsLogin>
    }
])

export default router