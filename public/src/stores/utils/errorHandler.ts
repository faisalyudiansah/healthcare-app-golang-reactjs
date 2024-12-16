import { ErrorRequestBody, ErrorRequestInvalid } from '@/@types/errorResponse';
import { ERROR_DEFAULT_MSG, ERROR_UNKNOWN_MSG } from '@/constants/error.contant';
import axios from 'axios';
import { Dispatch } from 'redux';

export const handleError = (
    error: unknown,
    dispatch: Dispatch,
    setError: (msg: string) => { payload: string; type: string }
  ) => {
    if (axios.isAxiosError(error)) {
      const errorResponse = error.response?.data;
      if ('errors' in errorResponse && Array.isArray(errorResponse.errors)) {
        const errorMsg: ErrorRequestBody = errorResponse;
        dispatch(setError(errorMsg?.errors[0]?.message || ERROR_DEFAULT_MSG));
      } else if ('message' in errorResponse) {
        const errorMsg: ErrorRequestInvalid = errorResponse;
        dispatch(setError(errorMsg?.message || ERROR_DEFAULT_MSG));
      } else {
        dispatch(setError(ERROR_DEFAULT_MSG));
      }
    } else if (error instanceof Error) {
      dispatch(setError(error.message));
    } else {
      dispatch(setError(ERROR_UNKNOWN_MSG));
    }
  };
  