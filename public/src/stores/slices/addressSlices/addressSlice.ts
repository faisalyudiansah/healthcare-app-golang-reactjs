import { createSlice } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';
import axios from 'axios';
import { BASE_URL, TOKEN_TYPE } from '@/constants/api.contant';
import { SUCCESS_MSG_RESPONSE_API } from '@/constants/success.contant';
import { handleError } from '@/stores/utils/errorHandler';
import { RequestAddress } from '@/@types/profile/request';
import { Address, SuccessGetSingleMyAddressAPI } from '@/@types/profile/response';

interface AddressState {
  //update address
  responseUpdateAddress: Address | null;
  isUpdateAddressLoading: boolean;
  isUpdateAddressSuccess: boolean;
  isUpdateAddressError: boolean;
  errorUpdateAddressMsg: string | null;
  //active address
  isActiveAddressLoading: boolean;
  isActiveAddressSuccess: boolean;
  isActiveAddressError: boolean;
  errorActiveAddressMsg: string | null;
  //delete my address
  isDeleteMyAddressLoading: boolean;
  isDeleteMyAddressSuccess: boolean;
  isDeleteMyAddressError: boolean;
  errorDeleteMyAddressMsg: string | null;
  //add my address
  isAddMyAddressLoading: boolean;
  isAddMyAddressSuccess: boolean;
  isAddMyAddressError: boolean;
  errorAddMyAddressMsg: string | null;
}

const initialState: AddressState = {
  //update address
  responseUpdateAddress: null,
  isUpdateAddressLoading: false,
  isUpdateAddressSuccess: false,
  isUpdateAddressError: false,
  errorUpdateAddressMsg: null,
  //active address
  isActiveAddressLoading: false,
  isActiveAddressSuccess: false,
  isActiveAddressError: false,
  errorActiveAddressMsg: null,
  //delete my address
  isDeleteMyAddressLoading: false,
  isDeleteMyAddressSuccess: false,
  isDeleteMyAddressError: false,
  errorDeleteMyAddressMsg: null,
  //Add my address
  isAddMyAddressLoading: false,
  isAddMyAddressSuccess: false,
  isAddMyAddressError: false,
  errorAddMyAddressMsg: null,
};

export const addressSlice = createSlice({
  name: 'address/slice',
  initialState,
  reducers: {
    //update address
    setResponseUpdateAddress: (state, action) => { state.responseUpdateAddress = action.payload; },
    setIsUpdateAddressLoading: (state, action) => { state.isUpdateAddressLoading = action.payload; },
    setIsUpdateAddressSuccess: (state, action) => { state.isUpdateAddressSuccess = action.payload; },
    setIsUpdateAddressError: (state, action) => { state.isUpdateAddressError = action.payload; },
    setErrorUpdateAddressMsg: (state, action) => { state.errorUpdateAddressMsg = action.payload; },
    //active address
    setIsActiveAddressLoading: (state, action) => { state.isActiveAddressLoading = action.payload; },
    setIsActiveAddressSuccess: (state, action) => { state.isActiveAddressSuccess = action.payload; },
    setIsActiveAddressError: (state, action) => { state.isActiveAddressError = action.payload; },
    setErrorActiveAddressMsg: (state, action) => { state.errorActiveAddressMsg = action.payload; },
    //delete my address
    setIsDeleteMyAddressLoading: (state, action) => { state.isDeleteMyAddressLoading = action.payload; },
    setIsDeleteMyAddressSuccess: (state, action) => { state.isDeleteMyAddressSuccess = action.payload; },
    setIsDeleteMyAddressError: (state, action) => { state.isDeleteMyAddressError = action.payload; },
    setErrorDeleteMyAddressMsg: (state, action) => { state.errorDeleteMyAddressMsg = action.payload; },
    //Add my address
    setIsAddMyAddressLoading: (state, action) => { state.isAddMyAddressLoading = action.payload; },
    setIsAddMyAddressSuccess: (state, action) => { state.isAddMyAddressSuccess = action.payload; },
    setIsAddMyAddressError: (state, action) => { state.isAddMyAddressError = action.payload; },
    setErrorAddMyAddressMsg: (state, action) => { state.errorAddMyAddressMsg = action.payload; },
  },
});

export const {
  //update address
  setResponseUpdateAddress,
  setIsUpdateAddressLoading,
  setIsUpdateAddressSuccess,
  setIsUpdateAddressError,
  setErrorUpdateAddressMsg,
  //active address
  setIsActiveAddressLoading,
  setIsActiveAddressSuccess,
  setIsActiveAddressError,
  setErrorActiveAddressMsg,
  //delete my address
  setIsDeleteMyAddressLoading,
  setIsDeleteMyAddressSuccess,
  setIsDeleteMyAddressError,
  setErrorDeleteMyAddressMsg,
  //Add my address
  setIsAddMyAddressLoading,
  setIsAddMyAddressSuccess,
  setIsAddMyAddressError,
  setErrorAddMyAddressMsg,


} = addressSlice.actions;

export const postNewAddress = (accessToken: string, input: RequestAddress) => async (dispatch: Dispatch): Promise<void> => {
  try {
    dispatch(setIsAddMyAddressLoading(true))
    const response = await axios.post<SuccessGetSingleMyAddressAPI>(`${BASE_URL}/users/me/addresses`, input, {
      headers: { Authorization: `${TOKEN_TYPE} ${accessToken}` },
    });
    const { message } = response.data;
    if (message === SUCCESS_MSG_RESPONSE_API) {
      dispatch(setIsAddMyAddressSuccess(true));
      dispatch(setIsAddMyAddressError(false));
    }
  } catch (error) {
    dispatch(setIsAddMyAddressError(true));
    dispatch(setIsAddMyAddressSuccess(false));
    handleError(error, dispatch, setErrorAddMyAddressMsg);
    throw error
  } finally {
    dispatch(setIsAddMyAddressLoading(false))
  }
};

export const putUpdateAddress = (accessToken: string, idAddress: number, input: RequestAddress) => async (dispatch: Dispatch): Promise<void> => {
  try {
    dispatch(setIsUpdateAddressLoading(true))
    const response = await axios.put<SuccessGetSingleMyAddressAPI>(`${BASE_URL}/users/me/addresses/${idAddress}`, input, {
      headers: { Authorization: `${TOKEN_TYPE} ${accessToken}` },
    });
    const { data, message } = response.data;
    if (message === SUCCESS_MSG_RESPONSE_API) {
      dispatch(setResponseUpdateAddress(data));
      dispatch(setIsUpdateAddressSuccess(true));
      dispatch(setIsUpdateAddressError(false));
    }
  } catch (error) {
    dispatch(setIsUpdateAddressError(true));
    dispatch(setIsUpdateAddressSuccess(false));
    handleError(error, dispatch, setErrorUpdateAddressMsg);
    throw error
  } finally {
    dispatch(setIsUpdateAddressLoading(false))
  }
};

export const patchActiveAddress = (accessToken: string, idAddress: number,) => async (dispatch: Dispatch): Promise<void> => {
  try {
    dispatch(setIsActiveAddressLoading(true))
    const response = await axios.patch<SuccessGetSingleMyAddressAPI>(`${BASE_URL}/users/me/addresses/${idAddress}`, null, {
      headers: { Authorization: `${TOKEN_TYPE} ${accessToken}` },
    });
    const { message } = response.data;
    if (message === SUCCESS_MSG_RESPONSE_API) {
      dispatch(setIsActiveAddressSuccess(true));
      dispatch(setIsActiveAddressError(false));
    }
  } catch (error) {
    dispatch(setIsActiveAddressError(true));
    dispatch(setIsActiveAddressSuccess(false));
    handleError(error, dispatch, setErrorActiveAddressMsg);
    throw error
  } finally {
    dispatch(setIsActiveAddressLoading(false))
  }
};

export const deleteMyAddress = (accessToken: string, idAddress: number,) => async (dispatch: Dispatch): Promise<void> => {
  try {
    dispatch(setIsDeleteMyAddressLoading(true))
    const response = await axios.delete<SuccessGetSingleMyAddressAPI>(`${BASE_URL}/users/me/addresses/${idAddress}`, {
      headers: { Authorization: `${TOKEN_TYPE} ${accessToken}` },
    });
    const { message } = response.data;
    if (message === SUCCESS_MSG_RESPONSE_API) {
      dispatch(setIsDeleteMyAddressSuccess(true));
      dispatch(setIsDeleteMyAddressError(false));
    }
  } catch (error) {
    dispatch(setIsDeleteMyAddressError(true));
    dispatch(setIsDeleteMyAddressSuccess(false));
    handleError(error, dispatch, setErrorDeleteMyAddressMsg);
    throw error
  } finally {
    dispatch(setIsDeleteMyAddressLoading(false))
  }
};

export const resetPutUpdateAddressError = () => async (dispatch: Dispatch): Promise<void> => {
  dispatch(setIsUpdateAddressError(false));
  dispatch(setIsUpdateAddressSuccess(false));
  dispatch(setErrorUpdateAddressMsg(null));
};

export const resetPatchActiveAddressError = () => async (dispatch: Dispatch): Promise<void> => {
  dispatch(setIsActiveAddressError(false));
  dispatch(setIsActiveAddressSuccess(false));
  dispatch(setErrorActiveAddressMsg(null));
};

export const resetDeleteMyAddressError = () => async (dispatch: Dispatch): Promise<void> => {
  dispatch(setIsDeleteMyAddressError(false));
  dispatch(setIsDeleteMyAddressSuccess(false));
  dispatch(setErrorDeleteMyAddressMsg(null));
};

export const resetAddMyAddressError = () => async (dispatch: Dispatch): Promise<void> => {
  dispatch(setIsAddMyAddressError(false));
  dispatch(setIsAddMyAddressSuccess(false));
  dispatch(setErrorAddMyAddressMsg(null));
};

export default addressSlice.reducer;
