import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { ThisForm } from './index';

interface ThisResponse {
  message: string;
}

const usePutFormPartner = (thisForm: ThisForm, onPartnerId: string) => {
  const [data, setData] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError('');
    setData('');

    const formData = new FormData();
    formData.append('name', thisForm.name);
    formData.append('logo', thisForm.logo!);
    formData.append('year_founded', thisForm.year_founded);
    formData.append('start_operation', thisForm.timeRange.startTime!);
    formData.append('end_operation', thisForm.timeRange.endTime!);
    formData.append('is_active', String(thisForm.isActive));

    for (const day of thisForm.active_days) {
      formData.append('active_days', day);
    }

    axios
      .putForm<ThisResponse>(`/admin/partners/${onPartnerId}`, formData)
      .then((res) => setData(res.data.message))
      .catch((err: AxiosError) => {
        setError((err.response?.data as ThisResponse).message.toTitle());
      })
      .finally(() => setLoading(false));
  };

  return { data, error, loading, fetchData };
};

export default usePutFormPartner;
