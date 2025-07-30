import { createBrowserRouter, Navigate } from 'react-router-dom'

import Login from '../components/YSK/Login'
import Shou from '../components/YSK/Shou'


// 路由守卫
const IsLogin = (props:any) => {
    let Com = props.children.type
    if (localStorage.getItem('token')) {
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
        path: '/list',
        element: <IsLogin><Shou /></IsLogin>
    },
    {
        path: '/',
        element: <IsLogin><Shou /></IsLogin>
    }
])

export default router