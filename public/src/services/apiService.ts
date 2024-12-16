import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { REQUEST_HEADER_AUTH_KEY, TOKEN_TYPE } from '@/constants/api.contant';

export const useAxiosInstance = () => {
    const [cookies] = useCookies(['access_token']);

    const axiosInstance = axios.create({
        baseURL: process.env.REACT_APP_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    useEffect(() => {
        const requestInterceptor = axiosInstance.interceptors.request.use(
            (config) => {
                const token = cookies.access_token;
                if (token) {
                    config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE} ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
        return () => {
            axiosInstance.interceptors.request.eject(requestInterceptor);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cookies.access_token]);

    return axiosInstance;
};
