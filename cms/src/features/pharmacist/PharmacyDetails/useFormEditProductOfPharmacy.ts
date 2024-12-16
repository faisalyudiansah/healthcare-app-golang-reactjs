import axios, { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { ThisForm } from '../../admin/ProductDetails';
import { EditProductOfPharmacyForm } from './EditPharmacyProduct';

interface ThisResponse {
  message: string;
}

const useFormEditProductOfPharmacy = (thisForm: EditProductOfPharmacyForm) => {
  const [data, setData] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    console.log('>>', thisForm);

    setLoading(true);
    axios
      .put<ThisResponse>(
        `/pharmacists/pharmacies/${thisForm.pharmacyId}/products/${thisForm.productId}`,
        {
          stock_quantity: thisForm.stock_quantity,
          is_active: thisForm.is_active,
        },
      )
      .then((res) => setData(res.data.message))
      .catch((err: AxiosError) => {
        setError((err.response?.data as ThisResponse).message.toTitle());
      })
      .finally(() => setLoading(false));
  };

  return { data, error, loading, fetchData, setData, setError, setLoading };
};

export default useFormEditProductOfPharmacy;
