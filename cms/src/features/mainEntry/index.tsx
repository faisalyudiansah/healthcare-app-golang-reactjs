import { ReactNode, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Login from './Login';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAuthState,
  setUserDetails,
} from '../../store/authentication/authSlice';
import useAxios from '../../hooks/useAxios';
import { AxiosRequestConfig } from 'axios';
import { IUser } from '../../models/Users';
import IBaseResponse from '@/models/IBaseResponse';

const MainEntry = () => {
  const authState = useSelector(getAuthState);
  const dispatch = useDispatch();
  const { fetchData, loading, data, setError, error } =
    useAxios<IBaseResponse<IUser>>('/users/me');

  useEffect(() => {
    if (authState.isVerified) {
      setError('');
    }
  }, [authState.isVerified]);

  let content: ReactNode;
  if (loading) {
    content = <div className="bg-white w-[100vw] h-[100vh]">loading!!!...</div>;
  } else {
    content = <Outlet />;
  }

  return content;
};

export default MainEntry;
