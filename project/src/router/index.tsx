import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '../components/YSK/Login'
import Shou from '../components/YSK/Shou'
import CategoryPage from '../components/YSK/CategoryPage'
import Classify from '../components/YSK/Classify'
import Mine from '../components/YSK/Mine'
import Account from '../components/YSK/Account'

import IsLogin from '../utils/islogin'


// 杨佳乐
import Shoppdetail from '../components/yjl/shoppdetail'
import Shopping from '../components/yjl/shopping'
import Cart from '../components/yjl/cart'
import CustomerService from '../components/yjl/CustomerService'
// import CustomerServiceTest from '../components/yjl/CustomerServiceTest'
// import TestCustomerService from '../components/yjl/TestCustomerService'
import MyOrder from '../components/yjl/myorder'
import OrderDetail from '../components/yjl/order-detail'

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
        path: '/cart',                                   // 购物车
        element: <Cart />
    },
    {
        path: '/myorder',                                // 我的订单
        element: <IsLogin><MyOrder /></IsLogin>
    },

    {
        path: '/ai-customer-service',                    // 智能客服
        element: <CustomerService />
    },
    // {
    //     path: '/customer-service-test',                  // 智能客服测试
    //     element: <CustomerServiceTest />
    // },
    // {
    //     path: '/test-customer-service',                  // 智能客服系统测试
    //     element: <TestCustomerService />
    // },
    {
        path: '/classify',                               // 分类
        element: <Classify />
    },
    {
        path: '/mine',                                   // 我的
        element: <IsLogin><Mine /></IsLogin>,
        children: [
            {
                path: 'account',
                element: <Account />
            }
        ]
    },
    {
        path: '/order-detail/:orderId',                  // 订单详情
        element: <IsLogin><OrderDetail /></IsLogin>
    },
    {
        path: '/',                                       // 根路径重定向到首页
        element: <Navigate to="/login" replace />
    },
])

export default router