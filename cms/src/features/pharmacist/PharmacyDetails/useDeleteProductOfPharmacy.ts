import axios, { AxiosError } from 'axios';
import { useState } from 'react';

interface ThisResponse {
  message: string;
}

const useDeleteProductOfPharmacy = (pharmacyId: number, productId: number) => {
  const [data, setData] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    // console.log('>>', productId, pharmacyId);
    // setTimeout(() => {
    //   setError('asda');
    //   setLoading(false);
    // }, 500);

    setLoading(true);
    axios
      .delete<ThisResponse>(
        `/pharmacists/pharmacies/${pharmacyId}/products/${productId}`,
      )
      .then((res) => setData(res.data.message))
      .catch((err: AxiosError) => {
        setError((err.response?.data as ThisResponse).message.toTitle());
      })
      .finally(() => setLoading(false));
  };

  return { data, error, loading, fetchData, setData, setError, setLoading };
};

export default useDeleteProductOfPharmacy;
