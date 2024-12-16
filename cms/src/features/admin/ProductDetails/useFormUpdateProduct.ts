import axios, { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { ThisForm } from '.';

interface ThisResponse {
  message: string;
}

const useFormUpdateProduct = (thisForm: ThisForm) => {
  const [data, setData] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [didSuccess, setDidSuccess] = useState(false);

  const fetchData = (productId: string) => {
    // setLoading(true);
    setError('');
    setData('');

    const formData = new FormData();
    formData.append('name', thisForm.name);
    formData.append('generic_name', thisForm.generic_name);
    formData.append('description', thisForm.description);
    formData.append('manufacture_id', String(thisForm.manufacture_id));
    formData.append(
      'product_classification_id',
      String(thisForm.product_classification_id),
    );
    formData.append('product_form_id', String(thisForm.product_form_id));
    thisForm.product_categories.forEach((d) => {
      formData.append('product_categories', String(d));
    });
    formData.append('unit_in_pack', String(thisForm.unit_in_pack));
    formData.append('selling_unit', String(thisForm.selling_unit));

    formData.append('weight', String(thisForm.weight));
    formData.append('height', String(thisForm.height));
    formData.append('width', String(thisForm.width));
    formData.append('length', String(thisForm.length));

    formData.append('is_active', String(thisForm.is_active));

    if (thisForm.thumbnail) {
      formData.append('thumbnail', thisForm.thumbnail);
    }
    if (thisForm.image) {
      formData.append('image', thisForm.image);
    }
    if (thisForm.secondary_image) {
      formData.append('secondary_image', thisForm.secondary_image);
    }
    if (thisForm.tertiary_image) {
      formData.append('tertiary_image', thisForm.tertiary_image);
    }

    console.log(thisForm);

    axios
      .putForm<ThisResponse>(`/admin/products/${productId}`, formData)
      .then((res) => {
        setData(res.data.message);
        setDidSuccess(true);
      })
      .catch((err: AxiosError) => {
        setError((err.response?.data as ThisResponse).message.toTitle());
      })
      .catch((e) => {
        setError('Something Wrong', e);
      })
      .finally(() => setLoading(false));
  };

  return { data, error, loading, fetchData, didSuccess };
};

export default useFormUpdateProduct;
