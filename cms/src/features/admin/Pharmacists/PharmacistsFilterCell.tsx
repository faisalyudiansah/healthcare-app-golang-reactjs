import React from 'react';
import {
  IFilterPharmacistsObject,
  IFilterPharmacistsText,
  IFilterPharmacistsYOERange,
} from '@/store/filterPharmacists/filterPharmacistsType';
import { RxCross1 } from 'react-icons/rx';
import { TWCenterize } from '@/utils/UI/TWStrings';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  removeOneTextFieldPharmacistsFilter,
  removeYOERangeFilterPharmacist,
} from '@/store/filterPharmacists/filterPharmacistsSlice';

const PharmacistsFilterCell: React.FC<{ object: IFilterPharmacistsObject }> = ({
  object,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const displayText: [string, string] = ['', ''];
  if (object.type === 'textfield') {
    const textFieldFilter = object.value as IFilterPharmacistsText;

    switch (textFieldFilter.name) {
      case 'email':
        displayText[0] = `E-Mail`;
        displayText[1] = `: ${textFieldFilter.value}`;
        break;
      case 'name':
        displayText[0] = `Name`;
        displayText[1] = `: ${textFieldFilter.value}`;
        break;
      case 'sipa':
        displayText[0] = `SIPA Number`;
        displayText[1] = `: ${textFieldFilter.value}`;
        break;
      case 'whatsapp':
        displayText[0] = `WhatsApp Number`;
        displayText[1] = `: ${textFieldFilter.value}`;
        break;
    }
  } else {
    displayText[0] = 'Years of Experience';
    const yoeRangeFilter = object.value as IFilterPharmacistsYOERange;

    if (yoeRangeFilter.minYoe <= 0) {
      displayText[1] = ': < 5';
    } else if (yoeRangeFilter.maxYoe > 30) {
      displayText[1] = ': > 30';
    } else {
      displayText[1] = `: ${yoeRangeFilter.minYoe} - ${yoeRangeFilter.maxYoe}`;
    }
  }

  const handleClickRemove = () => {
    if (object.type === 'textfield') {
      dispatch(
        removeOneTextFieldPharmacistsFilter(
          object.value as IFilterPharmacistsText,
        ),
      );
    } else {
      dispatch(removeYOERangeFilterPharmacist());
    }
  };

  return (
    <div className="flex justify-start items-center gap-2  bg-white rounded-md shadow-sm pl-3 pr-1 py-1">
      <div>
        <span className="font-medium mr-[1px]">{displayText[0]}</span>
        <span className="tracking-widest">{displayText[1]}</span>
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

export default PharmacistsFilterCell;
