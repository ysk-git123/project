import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '../components/YSK/Login'
import Shou from '../components/YSK/Shou'
import { isAuthenticated } from '../utils/auth'


// 路由守卫
const IsLogin = ({ children }: { children: React.ReactElement }) => {
    if (isAuthenticated()) {
        return children;
    } else {
        return <Navigate to='/login' replace />;
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
        path: '/',
        element: <IsLogin><Shou /></IsLogin>
    }
])

export default router