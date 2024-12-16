import axios, { AxiosRequestConfig } from 'axios';
import { useState } from 'react';

const jwtKey = import.meta.env.VITE_JWT_KEY_DELETE_LATER;

function useAxios<T>(
  url: string,
  method: 'get' | 'post' | 'put' | 'delete' = 'get',
) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = (config?: AxiosRequestConfig) => {
    setLoading(true);

    axios[method](url, {
      ...config,
      headers: {
        Authorization: `Bearer ${jwtKey}`,
      },
    })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return { fetchData, data, setData, setError, error, loading, setLoading };
}

export default useAxios;
