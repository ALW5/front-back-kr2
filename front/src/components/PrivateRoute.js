import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles }) => {
  const accessToken = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole'); // сохраняем при логине
  
  if (!accessToken) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/products" />;
  }
  
  return <Outlet />;
};

export default PrivateRoute;