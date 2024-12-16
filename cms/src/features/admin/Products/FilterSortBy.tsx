import { sortingValues, TSortingValues } from '@/models/SortingValues';
import { useDispatch, useSelector } from 'react-redux';
import { updateSortingFilters } from '@/store/filterProduct/filterProductsSlice';
import { BiSort } from 'react-icons/bi';
import { AppDispatch } from '@/store';
import { getModalsState, setShowSortModal } from '@/store/modals/modalsSlice';
import { ISortingPayload } from '@/store/filterProduct/filterProductsType';

const getTextToDisplay = (text: TSortingValues): string => {
  switch (text) {
    case 'A-Z':
      return 'A - Z';
    case 'Z-A':
      return 'Z - A';
    case 'latest':
      return 'Latest';
    case 'earliest':
      return 'Earliest';
    case 'highest-usage':
      return 'Highest Usage';
    case 'lowest-usage':
      return 'Lowest Usage';
  }
};

const FilterSortBy = () => {
  const dispatch = useDispatch<AppDispatch>();
  const modalsState = useSelector(getModalsState);

  const handleClickSortBtn = () => {
    if (!modalsState.showFilterSorting) {
      dispatch(setShowSortModal(true));
    }
  };

  const handleClickItemOnValue = (value: TSortingValues) => () => {
    let updateSortingPayload: ISortingPayload;
    switch (value) {
      case 'A-Z':
        updateSortingPayload = {
          sortBy: 'name',
          sort: 'asc',
        };
        break;
      case 'Z-A':
        updateSortingPayload = {
          sortBy: 'name',
          sort: 'desc',
        };
        break;
      case 'latest':
        updateSortingPayload = {
          sortBy: 'date',
          sort: 'desc',
        };
        break;
      case 'earliest':
        updateSortingPayload = {
          sortBy: 'date',
          sort: 'asc',
        };
        break;
      case 'highest-usage':
        updateSortingPayload = {
          sortBy: 'usage',
          sort: 'desc',
        };
        break;
      case 'lowest-usage':
        updateSortingPayload = {
          sortBy: 'usage',
          sort: 'asc',
        };
        break;
    }

    dispatch(updateSortingFilters(updateSortingPayload));
  };

  return (
    <div className="h-10 w-full relative ">
      <div
        className={`sorting-btn mt-[-3px]  ${
          modalsState.showFilterSorting && 'shadow-none !mt-0'
        }`}
        onClick={handleClickSortBtn}
      >
        <BiSort />
      </div>

      {/* DROPDOWN */}
      <div
        className={`w-[60%] bg-brand-gray-2 absolute top-[-8px] left-14 dropdown-products-default ${
          modalsState.showFilterSorting && 'dropdown-products-active'
        }`}
      >
        {/* ARROW GIMMICK */}
        <div className="absolute size-[18px] top-4 left-[-8px] bg-brand-gray-2 rotate-45"></div>

        <div className="absolute bg-inherit w-full  flex flex-col justify-start items-center rounded-md  cursor-pointer !overflow-hidden">
          {sortingValues.map((val) => (
            <div
              className="hover:bg-[#e2e2db] w-full text-slate-800 font-medium text-center py-2 text-nowrap overflow-hidden"
              key={val}
              onClick={handleClickItemOnValue(val)}
            >
              {getTextToDisplay(val)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSortBy;
