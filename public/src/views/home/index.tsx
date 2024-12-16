import HeroHome from "@/components/layout/home/HeroHome";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/template/toastify/Toast";
import { AppDispatch, RootState } from "@/stores";
import {
  resetForgotPasswordError,
  resetLoginError,
  resetRegisterError,
  resetResetPasswordError,
  resetSendVerificationEmailError,
  resetVerifyAccountError,
} from "@/stores/slices/authSlices/authSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Footer } from "@/components/layout/home/Footer";
import MostBought from "@/components/layout/home/MostBought";
import FloatingCart from "@/components/molecules/cart";
import { useCookies } from "react-cookie";
import CarouselHome from "@/components/layout/home/CarouselHome";
import ProductCategory from "@/components/layout/home/ProductCategory";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [cookies] = useCookies(["access_token"]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toastStatus, setToastStatus] = useState({
    isLoginErrorShown: false,
    isLoginSuccessShown: false,
    isLogoutSuccessShown: false,
    isRegisterErrorShown: false,
    isRegisterSuccessShown: false,
    isForgotPasswordErrorShown: false,
    isForgotPasswordSuccessShown: false,
    isVerifyAccountSuccessShown: false,
    isResetPasswordSuccessShown: false,
    isSendVerificationEmailErrorShown: false,
    isSendVerificationEmailSuccessShown: false,
  });

  const {
    isLoginSuccess,
    isLogoutSuccess,
    errorLoginMsg,
    isLoginError,
    isRegisterError,
    errorRegisterMsg,
    isRegisterSuccess,
    isVerifyAccountSuccess,
    isForgotPasswordError,
    errorForgotPasswordMsg,
    isForgotPasswordSuccess,
    isResetPasswordSuccess,
    isSendVerificationEmailError,
    isSendVerificationEmailSuccess,
    errorSendVerificationEmailMsg,
  } = useSelector((state: RootState) => state.authReducer);

  useEffect(() => {
    const handleToast = (
      condition: boolean,
      message: string | null,
      isError: boolean,
      resetAction: Function,
      toastKey: keyof typeof toastStatus
    ) => {
      if (condition && !toastStatus[toastKey]) {
        if (isError) {
          showErrorToast(message);
        } else {
          showSuccessToast(message);
        }
        const timerId = setTimeout(() => {
          dispatch(resetAction());
          setToastStatus((prev) => ({ ...prev, [toastKey]: false }));
        }, 3000);

        setToastStatus((prev) => ({ ...prev, [toastKey]: true }));
        return timerId;
      }
      return null;
    };

    const timers = [
      handleToast(isLoginError, errorLoginMsg, true, resetLoginError, "isLoginErrorShown"),
      handleToast(isLoginSuccess, "Login Successful!", false, resetLoginError, "isLoginSuccessShown"),
      handleToast(isLogoutSuccess, "Logout Successful!", false, resetLoginError, "isLogoutSuccessShown"),
      handleToast(isRegisterError, errorRegisterMsg, true, resetRegisterError, "isRegisterErrorShown"),
      handleToast(isRegisterSuccess, "Register Successful!", false, resetRegisterError, "isRegisterSuccessShown"),
      handleToast(isForgotPasswordError, errorForgotPasswordMsg, true, resetForgotPasswordError, "isForgotPasswordErrorShown"),
      handleToast(isForgotPasswordSuccess, "Forgot Password Successful!", false, resetForgotPasswordError, "isForgotPasswordSuccessShown"),
      handleToast(isVerifyAccountSuccess, "Verify Account Successful!", false, resetVerifyAccountError, "isVerifyAccountSuccessShown"),
      handleToast(isResetPasswordSuccess, "Reset Password Successful!", false, resetResetPasswordError, "isResetPasswordSuccessShown"),
      handleToast(isSendVerificationEmailError, errorSendVerificationEmailMsg, true, resetSendVerificationEmailError, "isSendVerificationEmailErrorShown"),
      handleToast(isSendVerificationEmailSuccess, "Your account verification email has been sent.", false, resetSendVerificationEmailError, "isSendVerificationEmailSuccessShown"),
    ].filter(Boolean) as NodeJS.Timeout[];

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [
    isLoginError,
    errorLoginMsg,
    isLoginSuccess,
    isLogoutSuccess,
    isRegisterError,
    errorRegisterMsg,
    isRegisterSuccess,
    isForgotPasswordError,
    errorForgotPasswordMsg,
    isForgotPasswordSuccess,
    isVerifyAccountSuccess,
    isResetPasswordSuccess,
    isSendVerificationEmailError,
    isSendVerificationEmailSuccess,
    errorSendVerificationEmailMsg,
  ]);

  useEffect(() => {
    if (cookies.access_token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [cookies.access_token]);

  return (
    <>
      <CarouselHome />
      <HeroHome />
      <ProductCategory/>
      <MostBought />
      <Footer />
      {isLoggedIn && <FloatingCart />}
      <ToastContainer />
    </>
  );
};

export default Home;
