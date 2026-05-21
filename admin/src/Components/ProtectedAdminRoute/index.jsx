import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';

const PUBLIC_PATHS = ['/login', '/sign-up', '/forgot-password', '/verify-account', '/change-password', '/unauthorized'];

const ProtectedAdminRoute = ({ children }) => {
  const context = useContext(MyContext);
  const location = useLocation();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setStatus('guest');
      return;
    }

    const role = context?.userData?.role;
    if (role === 'ADMIN') {
      setStatus('admin');
      return;
    }
    if (role && role !== 'ADMIN') {
      setStatus('forbidden');
      return;
    }

    fetchDataFromApi('/api/user/user-details')
      .then((res) => {
        const user = res?.data;
        if (user) {
          context?.setUserData?.(user);
        }
        if (user?.role === 'ADMIN') {
          setStatus('admin');
        } else if (user?.role) {
          setStatus('forbidden');
        } else {
          setStatus('forbidden');
        }
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        context?.setIsLogin?.(false);
        setStatus('guest');
      });
  }, [context?.userData?.role, context?.isLogin]);

  if (status === 'loading') {
    return (
      <Box className="flex items-center justify-center min-h-[60vh] w-full">
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'guest') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (status === 'forbidden') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
export { PUBLIC_PATHS };
