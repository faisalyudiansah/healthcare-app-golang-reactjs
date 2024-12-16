import axios, { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import SmallSpinner from './SmallSpinner';
import { TWCenterize } from '@/utils/UI/TWStrings';

const DownloadButton: React.FC<{
  endpoint: string;
  onSuccess?: (data: string) => void;
  onError?: (err: string) => void;
}> = ({ endpoint, onError, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (data) {
      onSuccess?.(data);
    }

    if (error) {
      onError?.(error);
    }
  }, [data, error]);

  const handleDownload = async () => {
    try {
      setLoading(true);

      const res = await axios.get(endpoint, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'text/csv',
        },
      });

      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      console.log('>>', url);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data.csv');

      document.body.appendChild(link);
      link.click();

      // cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setData('success');
    } catch (e) {
      setError(
        ((e as AxiosError).response?.data as { message: string }).message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className={`add-cta-navlink font-medium h-[44px] w-[110px]  select-none ${TWCenterize}`}
      disabled={loading}
    >
      {loading ? <SmallSpinner /> : 'Download'}
    </button>
  );
};

export default DownloadButton;
