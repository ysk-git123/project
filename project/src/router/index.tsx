import { createBrowserRouter, Navigate } from 'react-router-dom'

import Login from '../components/YSK/Login'
import Shou from '../components/YSK/Shou'
import CategoryPage from '../components/YSK/CategoryPage'
import { isAuthenticated } from '../utils/auth'


// 路由守卫
const IsLogin = (props:any) => {
    let Com = props.children.type
    if (isAuthenticated()) {
        return <Com></Com>
    } else {
        return <Navigate to='/login'></Navigate>
    }
}


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
    }
])

export default router