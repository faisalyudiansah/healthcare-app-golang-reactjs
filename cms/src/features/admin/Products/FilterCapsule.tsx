import React from 'react';
import {
  ISortingPayload,
  TKeysThatAreArray,
} from '@/store/filterProduct/filterProductsType';
import { RxCross2 } from 'react-icons/rx';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  removeAnItemFromFilterParams,
  removeFromSortingFilters,
} from '@/store/filterProduct/filterProductsSlice';
import { INameAndId } from '@/models/Products';

const FilterCapsule: React.FC<{
  onName: TKeysThatAreArray | 'sorting';
  thisResult?: INameAndId;
  sortingResult?: ISortingPayload;
}> = ({ onName, thisResult, sortingResult }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleClickCancel = () => {
    if (thisResult) {
      dispatch(
        removeAnItemFromFilterParams({
          keyName: onName as TKeysThatAreArray,
          item: thisResult,
        }),
      );
      return;
    }

    if (sortingResult) {
      dispatch(removeFromSortingFilters(sortingResult));
      return;
    }

    console.log('DID NOT DISPATCH ANYTHING');
  };

  let bgColor: string;
  switch (onName) {
    case 'sorting':
      bgColor = 'bg-yellow-500';
      break;
    case 'product-classification':
      bgColor = 'bg-yellow-500';
      break;
    case 'product-form':
      bgColor = 'bg-blue-500';
      break;
    case 'manufacture':
      bgColor = 'bg-green-500';
      break;
  }

  const textToDisplay = () => {
    if (thisResult) {
      return thisResult.name;
    }

    if (sortingResult) {
      if (sortingResult.sortBy === 'name' && sortingResult.sort === 'asc') {
        return 'A - Z';
      }
      if (sortingResult.sortBy === 'name' && sortingResult.sort === 'desc') {
        return 'Z - A';
      }
      if (sortingResult.sortBy === 'date' && sortingResult.sort === 'asc') {
        return 'Earliest';
      }
      if (sortingResult.sortBy === 'date' && sortingResult.sort === 'desc') {
        return 'Latest';
      }
      if (sortingResult.sortBy === 'usage' && sortingResult.sort === 'asc') {
        return 'Lowest Usage';
      }
      if (sortingResult.sortBy === 'usage' && sortingResult.sort === 'desc') {
        return 'Highest Usage';
      }
    }
  };
  return (
    <div
      className={`flex justify-start items-center p-2 gap-1 ${bgColor} rounded-md text-sm text-white font-medium`}
    >
      <div className="text-nowrap">{textToDisplay()}</div>
      <RxCross2
        size={16}
        className="text-slate-200 hover:cursor-pointer"
        onClick={handleClickCancel}
      />
    </div>
  );
};

export default FilterCapsule;
