import axios, { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { ThisForm } from '../../admin/ProductDetails';
import { AddProductToPharmacyForm } from './AddProductToPharmacy';

interface ThisResponse {
  message: string;
}

const useFormAddProductToPharmacy = (thisForm: AddProductToPharmacyForm) => {
  const [data, setData] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setData('ok');

    // setLoading(true);
    // axios
    //   .post<ThisResponse>(
    //     `/pharmacists/pharmacies/${thisForm.pharmacyId}/products`,
    //     {
    //       product_id: thisForm.product_id,
    //       stock_quantity: thisForm.stock_quantity,
    //       price: thisForm.price,
    //       is_active: thisForm.is_active,
    //     },
    //   )
    //   .then((res) => setData(res.data.message))
    //   .catch((err: AxiosError) => {
    //     setError((err.response?.data as ThisResponse).message.toTitle());
    //   })
    //   .finally(() => setLoading(false));
  };

  return { data, error, loading, fetchData, setData, setError, setLoading };
};

export default useFormAddProductToPharmacy;
