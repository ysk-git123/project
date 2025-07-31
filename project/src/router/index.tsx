
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
        path: '/login',
        element: <Login />
    },
    {
        path: '/shou',
        element: <IsLogin><Shou /></IsLogin>
    },
    {
        path: '/category/:category',
        element: <IsLogin><CategoryPage /></IsLogin>
    },
    {
        path: '/',
        element: <IsLogin><Shou /></IsLogin>
    },
    {
        path:'/shoppdetail',
        element:<Shoppdetail/>
    },
    {
        path:'/shopping',
        element:<Shopping/>
    }

])

export default router