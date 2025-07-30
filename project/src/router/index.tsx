import { createBrowserRouter } from 'react-router-dom'
import Login from '../components/YSK/Login'
import Shou from '../components/YSK/Shou'
import IsLogin from '../utils/islogin'
// 杨佳乐
import Shoppdetail from '../components/yjl/shoppdetail'
import Shopping from '../components/yjl/shopping'


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