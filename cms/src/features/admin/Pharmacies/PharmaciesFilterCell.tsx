import { RxCross1 } from 'react-icons/rx';
import { TWCenterize } from '@/utils/UI/TWStrings';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import React from 'react';
import {
  removePharmaciesFilterName,
  removePharmaciesFilterPartner,
  removePharmaciesFilterPhramacist,
} from '@/store/pharmacies/pharmaciesSlice';

const PharmaciesFilterCell: React.FC<{ field: string; object: string }> = ({
  field,
  object,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleClickRemove = () => {
    if (field === 'Pharmacy') {
      dispatch(removePharmaciesFilterName());
    }
    if (field === 'Partner') {
      dispatch(removePharmaciesFilterPartner());
      console.log('delete partner');
    }
    if (field === 'Pharmacist') {
      dispatch(removePharmaciesFilterPhramacist());
      console.log('delete pharmacist');
    }
  };

  return (
    <div className="flex justify-start items-center gap-2  bg-white rounded-md shadow-sm pl-3 pr-1 py-1">
      <div>
        <span className="font-medium mr-[1px]">{field} Name: </span>
        <span className="tracking-widest">{object}</span>
      </div>
      <div
        className={` size-7 ${TWCenterize} cursor-pointer`}
        onClick={handleClickRemove}
      >
        <RxCross1 className="size-5 text-slate-500" />
      </div>
    </div>
  );
};

export default PharmaciesFilterCell;
