import { TWCenterize } from '../../utils/UI/TWStrings';
import brandLogo from '../../assets/icons/pathosafe.svg';
import welcomingImg from '../../assets/images/welcoming.png';
import { useEffect, useRef, useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { showToastAsync } from '../../store/toast/toastSlice';
import { useForm } from 'react-hook-form';
import { validateEmail, validatePassword } from '../../utils/FormValidator';
import { handleKeyDown } from '../../utils/HandleKeys';
import {
  getAuthState,
  setLoginVerification,
  setUserDetails,
  signIn,
} from '../../store/authentication/authSlice';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import useAxios from '@/hooks/useAxios';
import IBaseResponse from '@/models/IBaseResponse';
import { IUser } from '@/models/Users';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { useNavigate } from 'react-router-dom';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

interface ThisForm {
  email: string;
  password: string;
}

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const authState = useSelector(getAuthState);
  const rakSignIn = useSignIn();

  const user = useAuthUser<IUser>();

  useEffect(() => {
    document.title = 'Pathosafe CMS';
  }, []);

  const [shouldShowPassword, setShouldShowPassword] = useState(false);
  const { fetchData, loading, data, setError, error } =
    useAxios<IBaseResponse<IUser>>('/users/me');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user]);

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

  useEffect(() => {
    if (!authState.dauHieu) return;
    fetchData();
  }, [authState.dauHieu]);

  useEffect(() => {
    if (!authState.dauHieu || !authState.user) return;

    if (
      rakSignIn({
        auth: {
          token: authState.dauHieu,
          type: 'Bearer',
        },
        userState: authState.user,
      })
    ) {
      // Redirect or do-something
      navigate('/');
    } else {
      //Throw error
      navigate('/login');
    }
  }, [authState.dauHieu, authState.user]);

  // const isVerified = useSelector(getAuthState).isVerified;

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authState.error) {
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

    if (authState.dauHieu) {
      dispatch(
        showToastAsync({
          message: 'Successfully Logged In',
          type: 'success',
        }),
      );
    }
  }, [authState.error, authState.dauHieu]);

  useEffect(() => {
    if (data && !loading) {
      console.log('masukini');
      dispatch(setUserDetails(data.data));
    }
  }, [data, loading]);

  const {
    register,
    trigger,
    formState: { errors },
  } = useForm<ThisForm>({ mode: 'onBlur' });

  return (
    <div className={`${TWCenterize} bg-[#ecfff9] w-[100vw] h-[100vh]`}>
      <div className="flex justify-start items-start w-[55%] max-w-[920px] h-[600px] bg-brand-green rounded-3xl overflow-clip login-card-shadow">
        {/* MARK: LEFT HERO */}
        <div className="pt-8 flex flex-col justify-center items-start gap-4 h-full w-[40%] bg-brand-green">
          <div className="text-[#087c55c9] font-bold text-2xl font-comfortaa w-[94%] pl-9 tracking-widest">
            Pathosafe Content Management System
          </div>
          <a
            className=" w-[85%] self-center"
            target="_blank"
            href="https://www.freepik.com/free-vector/pharmacist_4606184.htm#fromView=search&page=1&position=32&uuid=0ceb1002-63ad-452d-8163-619d76e495b7"
          >
            <img className="object-contain" src={welcomingImg} alt="" />
          </a>
        </div>

        {/* MARK: LOGIN SECTION */}
        <div className="bg-white w-[60%] h-full rounded-3xl px-14 pt-8">
          <img className=" w-8 mb-4 mt-4" src={brandLogo} alt="" />
          <div className="font-medium text-3xl text-slate-700">Sign in</div>
          <div className="mb-12 text-slate-400 mt-1">
            to continue using the app
          </div>
          <form>
            {/* MARK: EMAIL */}
            <div className="interactive-input">
              <input
                {...register('email', {
                  validate: () => {
                    if (!emailRef.current) return false;

                    return validateEmail(emailRef.current.value);
                  },
                })}
                className="subinput"
                type="text"
                placeholder=" "
                onKeyDown={handleKeyDown}
                autoComplete="off"
                ref={emailRef}
              />
              <label>Email</label>
            </div>
            {errors.email && (
              <div className="text-invalid-field">{errors.email.message}</div>
            )}

            {/* MARK: PASSWORD */}
            <div className="interactive-input mt-5">
              <input
                {...register('password', {
                  validate: () => {
                    if (!passwordRef.current) return false;

                    return validatePassword(passwordRef.current.value);
                  },
                })}
                className="subinput pr-12"
                type={shouldShowPassword ? 'text' : 'password'}
                placeholder=" "
                autoComplete="off"
                ref={passwordRef}
              />
              <label>Password</label>
              <div
                className={`${TWCenterize} w-14 absolute right-0 bottom-0 h-full text-primary cursor-pointer z-20`}
                onClick={() => setShouldShowPassword((prev) => !prev)}
              >
                {shouldShowPassword ? (
                  <FaRegEye className="h-full size-5" />
                ) : (
                  <FaRegEyeSlash className="h-full size-5" />
                )}
              </div>
            </div>
            {errors.password && (
              <div className="text-invalid-field">
                {errors.password.message}
              </div>
            )}

            {/* MARK: SIGN IN */}
            <button
              disabled={authState.loading || loading}
              className="bg-primary w-full h-[12] rounded-lg mt-12 py-4 text-green-100 text-lg font-medium selection:bg-transparent disabled:bg-slate-400 disabled:cursor-not-allowed disabled:text-white"
              onClick={handleClick}
            >
              {authState.loading || loading ? 'Loading...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
