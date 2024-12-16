import { INameAndId } from '@/models/Products';
import { useState } from 'react';

export const useUpdateProductCtgs = (defaultCtgs: INameAndId[]) => {
  const [ctgs, setCtgs] = useState(defaultCtgs);
  return { ctgs, setCtgs };
};

export const useUpdateManufacturer = (defaultManu: INameAndId) => {
  const [manu, setManu] = useState(defaultManu);
  return { manu, setManu };
};

export const useUpdateProductForm = (defaultProductForm: INameAndId) => {
  const [productForm, setProductForm] = useState(defaultProductForm);
  return { productForm, setProductForm };
};
