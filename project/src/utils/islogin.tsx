import { isAuthenticated } from '../utils/auth'
import {Navigate } from 'react-router-dom'
// 路由守卫
const IsLogin = ({ children }: { children: React.ReactElement }) => {
    if (isAuthenticated()) {
        return children;
    } else {
        return <Navigate to='/login' replace />;
    }
}
export default IsLogin;