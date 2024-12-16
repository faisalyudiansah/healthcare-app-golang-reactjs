import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DownloadButton from '@/components/ui/DownloadButton';
import { TWCenterize } from '@/utils/UI/TWStrings';
import axios from 'axios';
import React, { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ExportCSVModal: React.FC<{
  pharmacyId: number;
  onPharmacyName: string;
  shouldReset: boolean;
}> = ({ pharmacyId, onPharmacyName: pharmacyName, shouldReset }) => {
  const [didSuccess, setDidSuccess] = useState(false);
  const [error, setError] = useState('');

  // useEffect(() => {
  //   if (shouldReset) {
  //     setDidSuccess(false);
  //     setError('');
  //   }
  // }, [shouldReset]);

  let content: ReactNode;
  if (didSuccess) {
    content = <div className="text-center">Downloaded</div>;
  } else if (error) {
    content = (
      <div className="text-center">{`Failed to download. ${error}`}</div>
    );
  } else {
    content = (
      <>
        <div className={`${TWCenterize}`}>
          <div>
            Export product data from
            <span className="font-semibold text-slate-500">{` ${pharmacyName}`}</span>
          </div>
        </div>

        <DialogFooter className="mt-[-20px]  h-[80px] !flex !justify-center !items-center w-full">
          <DownloadButton
            onSuccess={() => setDidSuccess(true)}
            onError={(err) => setError(err)}
            endpoint={`/admin/pharmacies/${pharmacyId}/products/export`}
          />
        </DialogFooter>
      </>
    );
  }
  return (
    <DialogContent className="sm:max-w-[525px] px-8 pt-[40px]">
      <DialogHeader className=" flex justify-center items-center">
        <DialogTitle className="text-center w-[70%] !text-xl">
          Download CSV
        </DialogTitle>
      </DialogHeader>
      {content}
    </DialogContent>
  );
};

export default ExportCSVModal;
