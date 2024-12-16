import { createSlice } from '@reduxjs/toolkit';
import { SuccessLoginAPI, SuccessGetMeAPI, SuccessRegisterAPI, JwtPayload } from '@/@types/auth/response';
import { Dispatch } from 'redux';
import { RequestForgetPassword, RequestLogin, RequestRegister, RequestResetPassword, RequestVerifyAccount } from '@/@types/auth/request';
import axios from 'axios';
import { BASE_URL, TOKEN_TYPE } from '@/constants/api.contant';
import { SuccessResponseMessageOnly } from '@/@types/successResponse';
import { SUCCESS_MSG_RESPONSE_API } from '@/constants/success.contant';
import { handleError } from '@/stores/utils/errorHandler';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  isRegisterError: boolean;
  isRegisterSuccess: boolean;
  errorRegisterMsg: string | null;
  isLoginError: boolean;
  isLoginSuccess: boolean;
  errorLoginMsg: string | null;
  dataUser: SuccessGetMeAPI | null;
  isLogoutSuccess: boolean;
  isVerifyAccountError: boolean;
  isVerifyAccountSuccess: boolean;
  errorVerifyAccountMsg: string | null;
  isForgotPasswordError: boolean;
  isForgotPasswordSuccess: boolean;
  errorForgotPasswordMsg: string | null;
  isResetPasswordError: boolean;
  isResetPasswordSuccess: boolean;
  errorResetPasswordMsg: string | null;
  isSendVerificationEmailError: boolean;
  isSendVerificationEmailSuccess: boolean;
  errorSendVerificationEmailMsg: string | null;
}

const initialState: AuthState = {
  isRegisterError: false,
  isRegisterSuccess: false,
  errorRegisterMsg: null,
  isLoginError: false,
  isLoginSuccess: false,
  errorLoginMsg: null,
  dataUser: null,
  isLogoutSuccess: false,
  isVerifyAccountError: false,
  isVerifyAccountSuccess: false,
  errorVerifyAccountMsg: null,
  isForgotPasswordError: false,
  isForgotPasswordSuccess: false,
  errorForgotPasswordMsg: null,
  isResetPasswordError: false,
  isResetPasswordSuccess: false,
  errorResetPasswordMsg: null,
  isSendVerificationEmailError: false,
  isSendVerificationEmailSuccess: false,
  errorSendVerificationEmailMsg: null,
};

export const authSlice = createSlice({
  name: 'auth/slice',
  initialState,
  reducers: {
    setIsRegisterError: (state, action) => { state.isRegisterError = action.payload; },
    setErrorRegisterMsg: (state, action) => { state.errorRegisterMsg = action.payload; },
    setRegisterSuccess: (state, action) => { state.isRegisterSuccess = action.payload; },
    setIsLoginError: (state, action) => { state.isLoginError = action.payload; },
    setIsLoginSuccess: (state, action) => { state.isLoginSuccess = action.payload; },
    setErrorLoginMsg: (state, action) => { state.errorLoginMsg = action.payload; },
    setDataUser: (state, action) => { state.dataUser = action.payload; },
    setIsLogoutSuccess: (state, action) => { state.isLogoutSuccess = action.payload; },
    setIsVerifyAccountError: (state, action) => { state.isVerifyAccountError = action.payload; },
    setIsVerifyAccountSuccess: (state, action) => { state.isVerifyAccountSuccess = action.payload; },
    setErrorVerifyAccountMsg: (state, action) => { state.errorVerifyAccountMsg = action.payload; },
    setIsForgotPasswordError: (state, action) => { state.isForgotPasswordError = action.payload; },
    setIsForgotPasswordSuccess: (state, action) => { state.isForgotPasswordSuccess = action.payload; },
    setErrorForgotPasswordMsg: (state, action) => { state.errorForgotPasswordMsg = action.payload; },
    setIsResetPasswordError: (state, action) => { state.isResetPasswordError = action.payload; },
    setIsResetPasswordSuccess: (state, action) => { state.isResetPasswordSuccess = action.payload; },
    setErrorResetPasswordMsg: (state, action) => { state.errorResetPasswordMsg = action.payload; },
    setIsSendVerificationEmailError: (state, action) => { state.isSendVerificationEmailError = action.payload; },
    setIsSendVerificationEmailSuccess: (state, action) => { state.isSendVerificationEmailSuccess = action.payload; },
    setErrorSendVerificationEmailMsg: (state, action) => { state.errorSendVerificationEmailMsg = action.payload; },
  },
});

export const {
  setIsRegisterError,
  setErrorRegisterMsg,
  setRegisterSuccess,
  setIsLoginError,
  setIsLoginSuccess,
  setErrorLoginMsg,
  setDataUser,
  setIsLogoutSuccess,
  setIsVerifyAccountError,
  setIsVerifyAccountSuccess,
  setErrorVerifyAccountMsg,
  setIsForgotPasswordError,
  setIsForgotPasswordSuccess,
  setErrorForgotPasswordMsg,
  setIsResetPasswordError,
  setIsResetPasswordSuccess,
  setErrorResetPasswordMsg,
  setIsSendVerificationEmailError,
  setIsSendVerificationEmailSuccess,
  setErrorSendVerificationEmailMsg,
} = authSlice.actions;

export const login = (input: RequestLogin, setCookie: Function) => async (dispatch: Dispatch): Promise<void> => {
  try {
    dispatch(setIsLogoutSuccess(false));
    const response = await axios.post<SuccessLoginAPI>(`${BASE_URL}/auth/login`, input);
    const { data } = response.data;
    if (!data.access_token) {
      throw new Error('Access token is missing');
    }
    const ac = jwtDecode<JwtPayload>(data.access_token);
    if (ac.role !== 1) {
      throw new Error('Access denied: Unauthorized role');
    }
    setCookie('access_token', data.access_token, { path: '/', maxAge: 604800 });
    dispatch(setIsLoginError(false));
    dispatch(setErrorLoginMsg(null));
    dispatch(setIsLoginSuccess(true));
  } catch (error) {
    dispatch(setIsLoginSuccess(false));
    dispatch(setIsLoginError(true));
    handleError(error, dispatch, setErrorLoginMsg);
    throw error
  }
};

export const getMe = (accessToken: string) => async (dispatch: Dispatch): Promise<void> => {
  try {
    if (!accessToken) {
      throw new Error('Access token is missing');
    }
    const ac = jwtDecode<JwtPayload>(accessToken)
    if (ac.role !== 1) {
      throw new Error('Access denied: Unauthorized role');
    }
    const response = await axios.get<SuccessGetMeAPI>(`${BASE_URL}/users/me`, {
      headers: { Authorization: `${TOKEN_TYPE} ${accessToken}` },
    });
    dispatch(setDataUser(response.data));
  } catch (error) {
    console.error(error);
    throw error
  }
};
export const logout = (accessToken: string) => async (dispatch: Dispatch): Promise<void> => {
  try {
    if (!accessToken) {
      throw new Error('Access token is missing');
    }
    const ac = jwtDecode<JwtPayload>(accessToken)
    if (ac.role !== 1) {
      throw new Error('Access denied: Unauthorized role');
    }
    await axios.post<SuccessGetMeAPI>(`${BASE_URL}/auth/logout`, {
      headers: { Authorization: `${TOKEN_TYPE} ${accessToken}` },
    });
    dispatch(setDataUser(null));
    dispatch(setIsLogoutSuccess(true));
  } catch (error) {
    console.error(error);
    throw error
  }
};

export const register = (input: RequestRegister) => async (dispatch: Dispatch): Promise<void> => {
  try {
    const response = await axios.post<SuccessRegisterAPI>(`${BASE_URL}/auth/register`, input);
    const { message } = response.data;
    if (message === SUCCESS_MSG_RESPONSE_API) {
      dispatch(setIsRegisterError(false));
      dispatch(setErrorRegisterMsg(null));
      dispatch(setRegisterSuccess(true));
    }
  } catch (error) {
    dispatch(setRegisterSuccess(false));
    dispatch(setIsRegisterError(true));
    handleError(error, dispatch, setErrorRegisterMsg);
    throw error
  }
};

export const verificationAccount = (input: RequestVerifyAccount) => async (dispatch: Dispatch): Promise<void> => {
  try {
    const response = await axios.post<SuccessResponseMessageOnly>(`${BASE_URL}/auth/verify-email`, input);
    const { message } = response.data;
    if (message === SUCCESS_MSG_RESPONSE_API) {
      dispatch(setIsVerifyAccountError(false));
      dispatch(setErrorVerifyAccountMsg(null));
      dispatch(setIsVerifyAccountSuccess(true));
    }
  } catch (error) {
    dispatch(setIsVerifyAccountSuccess(false));
    dispatch(setIsVerifyAccountError(true));
    handleError(error, dispatch, setErrorVerifyAccountMsg);
    throw error
  }
};

export const sendVerificationEmail = (email: string) => async (dispatch: Dispatch): Promise<void> => {
  try {
    const response = await axios.post<SuccessResponseMessageOnly>(`${BASE_URL}/auth/send-verification`, {
      email: email
    });
    const { message } = response.data;
    if (message === SUCCESS_MSG_RESPONSE_API) {
      const currentTime = Date.now();
      const verificationData = JSON.parse(localStorage.getItem('verificationData') || '[]');
      const existingEmailIndex = verificationData.findIndex((item: { email: string }) => item.email === email);
      if (existingEmailIndex !== -1) {
        verificationData[existingEmailIndex].timestamp = currentTime;
      } else {
        verificationData.push({ email, timestamp: currentTime });
      }
      localStorage.setItem('verificationData', JSON.stringify(verificationData));
      dispatch(setIsSendVerificationEmailError(false));
      dispatch(setErrorSendVerificationEmailMsg(null));
      dispatch(setIsSendVerificationEmailSuccess(true));
    }
  } catch (error) {
    dispatch(setIsSendVerificationEmailSuccess(false));
    dispatch(setIsSendVerificationEmailError(true));
    handleError(error, dispatch, setErrorSendVerificationEmailMsg);
    throw error
  }
};

export const forgetPassword = (input: RequestForgetPassword) => async (dispatch: Dispatch): Promise<void> => {
  try {
    const response = await axios.post<SuccessResponseMessageOnly>(`${BASE_URL}/auth/forgot-password`, input);
    const { message } = response.data;
    if (message === SUCCESS_MSG_RESPONSE_API) {
      dispatch(setIsForgotPasswordError(false));
      dispatch(setErrorForgotPasswordMsg(null));
      dispatch(setIsForgotPasswordSuccess(true));
    }
  } catch (error) {
    dispatch(setIsForgotPasswordSuccess(false));
    dispatch(setIsForgotPasswordError(true));
    handleError(error, dispatch, setErrorForgotPasswordMsg);
    throw error
  }
};

export const resetPassword = (input: RequestResetPassword) => async (dispatch: Dispatch): Promise<void> => {
  try {
    const response = await axios.post<SuccessResponseMessageOnly>(`${BASE_URL}/auth/reset-password`, input);
    const { message } = response.data;
    if (message === SUCCESS_MSG_RESPONSE_API) {
      dispatch(setIsResetPasswordError(false));
      dispatch(setErrorResetPasswordMsg(null));
      dispatch(setIsResetPasswordSuccess(true));
    }
  } catch (error) {
    dispatch(setIsResetPasswordSuccess(false));
    dispatch(setIsResetPasswordError(true));
    handleError(error, dispatch, setErrorResetPasswordMsg);
    throw error
  }
};

export const resetRegisterError = () => async (dispatch: Dispatch): Promise<void> => {
  dispatch(setIsRegisterError(false));
  dispatch(setErrorRegisterMsg(null));
  dispatch(setRegisterSuccess(false));
};

export const resetLoginError = () => async (dispatch: Dispatch): Promise<void> => {
  dispatch(setIsLoginError(false));
  dispatch(setErrorLoginMsg(null));
  dispatch(setIsLoginSuccess(false));
};

export const resetVerifyAccountError = () => async (dispatch: Dispatch): Promise<void> => {
  dispatch(setIsVerifyAccountError(false));
  dispatch(setErrorVerifyAccountMsg(null));
  dispatch(setIsVerifyAccountSuccess(false));
};

export const resetForgotPasswordError = () => async (dispatch: Dispatch): Promise<void> => {
  dispatch(setIsForgotPasswordError(false));
  dispatch(setErrorForgotPasswordMsg(null));
  dispatch(setIsForgotPasswordSuccess(false));
};

export const resetResetPasswordError = () => async (dispatch: Dispatch): Promise<void> => {
  dispatch(setIsResetPasswordError(false));
  dispatch(setErrorResetPasswordMsg(null));
  dispatch(setIsResetPasswordSuccess(false));
};

export const resetSendVerificationEmailError = () => async (dispatch: Dispatch): Promise<void> => {
  dispatch(setIsSendVerificationEmailError(false));
  dispatch(setErrorSendVerificationEmailMsg(null));
  dispatch(setIsSendVerificationEmailSuccess(false));
};

export default authSlice.reducer;
