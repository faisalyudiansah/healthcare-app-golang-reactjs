import React, { ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { pathosafeImg } from '@/const';
import { AuroraBackground } from '@/components/molecules/AuroraBackground';
import { useDispatch, useSelector } from 'react-redux';
import { getAuthState, setLoginVerification, setUserDetails, signIn } from '@/store/authentication/authSlice';
import useAxios from '@/hooks/useAxios';
import { AxiosRequestConfig } from 'axios';
import { IUser } from '@/models/Users';
import { Outlet } from 'react-router-dom';
import { AppDispatch } from '@/store';
import { useForm } from 'react-hook-form';
import { validateEmail, validatePassword } from '@/utils/FormValidator';
import { handleKeyDown } from '@/utils/HandleKeys';
import { showToastAsync } from '@/store/toast/toastSlice';
import IBaseResponse from '../../../../models/IBaseResponse';

export const Login: React.FC = () => {
  const authState = useSelector(getAuthState);
  const dispatch = useDispatch();
  const { fetchData, loading, data, setError, error } =
    useAxios<IBaseResponse<IUser>>('/users/me');

  useEffect(() => {
    let config: AxiosRequestConfig = {};
    if (authState.dauHieu) {
      config = {
        headers: {
          Authorization: `Bearer ${authState.dauHieu}`,
        },
      };
    }

    fetchData(config);
  }, []);

  useLayoutEffect(() => {
    if (data) {
      dispatch(setUserDetails(data.data));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (authState.isVerified) {
      setError('');
    }
  }, [authState.isVerified, setError]);

  const authenticated = true;
  let content: ReactNode;
  if (loading) {
    content = (
      <div className="bg-[#ecfff9] w-[100vw] h-[100vh]">loading!!!...</div>
    );
  } else if (authenticated && authState.dauHieu && !error) {
    content = <Outlet />;
  } else {
    content = <LoginForm/>
  }

  return content;
};


interface ThisForm {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector(getAuthState);

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    if (!(await trigger())) return;

    if (!emailRef.current || !passwordRef.current) return;
    dispatch(
      signIn({
        email: emailRef.current.value,
        password: passwordRef.current.value,
      }),
    );
  };

  const isVerified = useSelector(getAuthState).isVerified;

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authState.loading) {
      // TOAST ERROR
      if (authState.error && !authState.loading) {
        dispatch((d, state) => {
          if (!state().toast.shouldShow) {
            d(
              showToastAsync({
                message: authState.error,
                type: 'warning',
              }),
            );
          }
        });
        return;
      }

      // TOAST SUCCESS
      if (
        !isVerified &&
        authState.dauHieu &&
        !authState.loading &&
        !authState.error
      ) {
        setTimeout(() => {
          dispatch(setLoginVerification(true));
        }, 500);
        dispatch(async (d, state) => {
          if (!state().toast.shouldShow) {
            d(
              showToastAsync({
                message: 'Successfully Logged In',
                type: 'success',
              }),
            );
          }
        });
      }
    }
  }, [authState]);

  const {
    register,
    trigger,
    formState: { errors },
  } = useForm<ThisForm>({ mode: 'onBlur' });

  return (
    <div className="w-full lg:grid lg:grid-cols-2 min-h-screen">
      <AuroraBackground className="relative hidden justify-start items-start h-full flex-col bg-muted p-10 dark:text-white lg:flex dark:border-r">
        <div className="flex items-center text-lg font-bold gap-3 ">
          <img
            src={pathosafeImg}
            alt="Pathosafe Icon"
            className="h-8 aspect-square"
          />
          <p>Pathosafe</p>
        </div>
      </AuroraBackground>
      <div className="flex h-screen items-center justify-center px-12 py-12 bg-black lg:px-0">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold text-white">Login</h1>
            <p className="text-balance text-white">
              Enter your email below to login to your account
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@gmail.com"
                className="text-white"
                required
                {...register('email', {
                  validate: () => {
                    if (!emailRef.current) return false;

                    return validateEmail(emailRef.current.value);
                  },
                })}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                ref={emailRef}
              />
              {errors.email && (
                <div className="text-red-600">{errors.email.message}</div>
              )}
            </div>
            <div className="grid gap-2 relative">
              <Label htmlFor="email">Password</Label>
              <Input
                id="password"
                required
                className="text-white"
                {...register('password', {
                  validate: () => {
                    if (!passwordRef.current) return false;

                    return validatePassword(passwordRef.current.value);
                  },
                })}
                type={'password'}
                autoComplete="off"
                ref={passwordRef}
              />
              {errors.password && (
                <div className="text-red-600">{errors.password.message}</div>
              )}
            </div>
            <Button
              disabled={authState.loading}
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-800 text-white hover:text-opacity-75"
              onClick={handleClick}
            >
              {authState.loading ? 'Loading...' : 'Login'}
            </Button>
            <p className="px-8 text-center text-sm text-white dark:text-muted-foreground">
              <p>By clicking login, you agree to our</p>
              <span className="underline underline-offset-4 hover:text-primary cursor-pointer">
                Terms of Service
              </span>
              <span> and </span>
              <span className="underline underline-offset-4 hover:text-primary cursor-pointer">
                Privacy Policy
              </span>
              <span>.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}