import { createSlice } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';
import axios from 'axios';
import { BASE_URL, TOKEN_TYPE } from '@/constants/api.contant';
import { SUCCESS_MSG_RESPONSE_API } from '@/constants/success.contant';
import { handleError } from '@/stores/utils/errorHandler';
import { SuccessGetApiCluster } from '@/@types/address/cluster';
import { RootState } from '@/stores';

interface ClusterState {
    //province
    dataProvinceCluster: SuccessGetApiCluster | null
    isDataProvinceLoading: boolean;
    errorDataProvinceMsg: string | null;
    //city
    dataCityCluster: SuccessGetApiCluster | null
    isDataCityLoading: boolean;
    errorDataCityMsg: string | null;
    //district
    dataDistrictCluster: SuccessGetApiCluster | null
    isDataDistrictLoading: boolean;
    errorDataDistrictMsg: string | null;
    //SubDistrict
    dataSubDistrictCluster: SuccessGetApiCluster | null
    isDataSubDistrictLoading: boolean;
    errorDataSubDistrictMsg: string | null;
}

const initialState: ClusterState = {
    //province
    dataProvinceCluster: null,
    isDataProvinceLoading: false,
    errorDataProvinceMsg: null,
    //city
    dataCityCluster: null,
    isDataCityLoading: false,
    errorDataCityMsg: null,
    //District
    dataDistrictCluster: null,
    isDataDistrictLoading: false,
    errorDataDistrictMsg: null,
    //SubDistrict
    dataSubDistrictCluster: null,
    isDataSubDistrictLoading: false,
    errorDataSubDistrictMsg: null,
};

export const clusterSlice = createSlice({
    name: 'cluster/slice',
    initialState,
    reducers: {
        //province
        setDataProvinceCluster: (state, action) => { state.dataProvinceCluster = action.payload; },
        setIsDataProvinceLoading: (state, action) => { state.isDataProvinceLoading = action.payload; },
        setErrorDataProvinceMsg: (state, action) => { state.errorDataProvinceMsg = action.payload; },
        //city
        setDataCityCluster: (state, action) => { state.dataCityCluster = action.payload; },
        setIsDataCityLoading: (state, action) => { state.isDataCityLoading = action.payload; },
        setErrorDataCityMsg: (state, action) => { state.errorDataCityMsg = action.payload; },
        //District
        setDataDistrictCluster: (state, action) => { state.dataDistrictCluster = action.payload; },
        setIsDataDistrictLoading: (state, action) => { state.isDataDistrictLoading = action.payload; },
        setErrorDataDistrictMsg: (state, action) => { state.errorDataDistrictMsg = action.payload; },
        //SubDistrict
        setDataSubDistrictCluster: (state, action) => { state.dataSubDistrictCluster = action.payload; },
        setIsDataSubDistrictLoading: (state, action) => { state.isDataSubDistrictLoading = action.payload; },
        setErrorDataSubDistrictMsg: (state, action) => { state.errorDataSubDistrictMsg = action.payload; },
    },
});

export const {
    //province
    setDataProvinceCluster,
    setIsDataProvinceLoading,
    setErrorDataProvinceMsg,
    //city
    setDataCityCluster,
    setIsDataCityLoading,
    setErrorDataCityMsg,
    //District
    setDataDistrictCluster,
    setIsDataDistrictLoading,
    setErrorDataDistrictMsg,
    //SubDistrict
    setDataSubDistrictCluster,
    setIsDataSubDistrictLoading,
    setErrorDataSubDistrictMsg,
} = clusterSlice.actions;

export const getProvince = (accessToken: string, limit: number = 10, page: number = 1, stack: boolean) => async (dispatch: Dispatch, getState: () => RootState): Promise<void> => {
    try {
        dispatch(setIsDataProvinceLoading(true))
        const response = await axios.get<SuccessGetApiCluster>(`${BASE_URL}/clusters/provinces?limit=${limit}&page=${page}`, {
            headers: { Authorization: `${TOKEN_TYPE} ${accessToken}` },
        });
        const { message } = response.data;
        if (message === SUCCESS_MSG_RESPONSE_API) {
            if (stack) {
                const currentData = getState().clusterReducer.dataProvinceCluster?.data || [];
                dispatch(setDataProvinceCluster({
                    ...response.data,
                    data: [...currentData, ...response.data.data],
                }));
                return
            }
            dispatch(setDataProvinceCluster(response.data))
        }
    } catch (error) {
        handleError(error, dispatch, setErrorDataProvinceMsg);
        throw error
    } finally {
        dispatch(setIsDataProvinceLoading(false))
    }
};

export const getCity = (accessToken: string, limit: number = 10, page: number = 1, province: string, stack: boolean) => async (dispatch: Dispatch, getState: () => RootState): Promise<void> => {
    try {
        dispatch(setIsDataCityLoading(true))
        const response = await axios.get<SuccessGetApiCluster>(`${BASE_URL}/clusters/cities?limit=${limit}&page=${page}&province=${province}`, {
            headers: { Authorization: `${TOKEN_TYPE} ${accessToken}` },
        });
        const { message } = response.data;
        if (message === SUCCESS_MSG_RESPONSE_API) {
            if (stack) {
                const currentData = getState().clusterReducer.dataCityCluster?.data || [];
                dispatch(setDataCityCluster({
                    ...response.data,
                    data: [...currentData, ...response.data.data],
                }));
                return
            }
            dispatch(setDataCityCluster(response.data))
        }
    } catch (error) {
        handleError(error, dispatch, setErrorDataCityMsg);
        throw error
    } finally {
        dispatch(setIsDataCityLoading(false))
    }
};

export const getDistrict = (accessToken: string, limit: number = 10, page: number = 1, province: string, city: string, stack: boolean) => async (dispatch: Dispatch, getState: () => RootState): Promise<void> => {
    try {
        dispatch(setIsDataDistrictLoading(true))
        const response = await axios.get<SuccessGetApiCluster>(`${BASE_URL}/clusters/districts?limit=${limit}&page=${page}&province=${province}&city=${city}`, {
            headers: { Authorization: `${TOKEN_TYPE} ${accessToken}` },
        });
        const { message } = response.data;
        if (message === SUCCESS_MSG_RESPONSE_API) {
            if (stack) {
                const currentData = getState().clusterReducer.dataDistrictCluster?.data || [];
                dispatch(setDataDistrictCluster({
                    ...response.data,
                    data: [...currentData, ...response.data.data],
                }));
                return
            }
            dispatch(setDataDistrictCluster(response.data))
        }
    } catch (error) {
        handleError(error, dispatch, setErrorDataDistrictMsg);
        throw error
    } finally {
        dispatch(setIsDataDistrictLoading(false))
    }
};

export const getSubDistrict = (accessToken: string, limit: number = 10, page: number = 1, province: string, city: string, district: string, stack: boolean) => async (dispatch: Dispatch, getState: () => RootState): Promise<void> => {
    try {
        dispatch(setIsDataSubDistrictLoading(true))
        const response = await axios.get<SuccessGetApiCluster>(`${BASE_URL}/clusters/sub-districts?limit=${limit}&page=${page}&province=${province}&city=${city}&district=${district}`, {
            headers: { Authorization: `${TOKEN_TYPE} ${accessToken}` },
        });
        const { message } = response.data;
        if (message === SUCCESS_MSG_RESPONSE_API) {
            if (stack) {
                const currentData = getState().clusterReducer.dataSubDistrictCluster?.data || [];
                dispatch(setDataSubDistrictCluster({
                    ...response.data,
                    data: [...currentData, ...response.data.data],
                }));
                return
            }
            dispatch(setDataSubDistrictCluster(response.data))
        }
    } catch (error) {
        handleError(error, dispatch, setErrorDataSubDistrictMsg);
        throw error
    } finally {
        dispatch(setIsDataSubDistrictLoading(false))
    }
};

export const resetDataProvinceError = () => async (dispatch: Dispatch): Promise<void> => {
    dispatch(setErrorDataProvinceMsg(null));
};

export const resetDataCityError = () => async (dispatch: Dispatch): Promise<void> => {
    dispatch(setErrorDataCityMsg(null));
};

export const resetDataDistrictError = () => async (dispatch: Dispatch): Promise<void> => {
    dispatch(setErrorDataDistrictMsg(null));
};

export const resetDataSubDistrictError = () => async (dispatch: Dispatch): Promise<void> => {
    dispatch(setErrorDataSubDistrictMsg(null));
};

export default clusterSlice.reducer;
