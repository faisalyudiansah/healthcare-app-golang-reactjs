import { Outlet, useNavigate } from 'react-router-dom'
import Navbar from '../template/navbar/Navbar'
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { getMe, logout } from '@/stores/slices/authSlices/authSlice';
import { AppDispatch } from '@/stores';
import { useDispatch } from 'react-redux';

const MainLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate()
  const [cookies, , removeCookie] = useCookies(['access_token']);

  async function getDataMe(token: string) {
    try {
      await dispatch(getMe(token));
    } catch (error) {
      console.log(error)
      handleLogout()
    }
  }

  const handleLogout = () => {
    removeCookie('access_token', { path: '/' });
    dispatch(logout(cookies.access_token))
    navigate("/")
  };

  useEffect(() => {
    if (cookies.access_token) {
      getDataMe(cookies.access_token);
    }
  }, [cookies.access_token]);

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

export default MainLayout