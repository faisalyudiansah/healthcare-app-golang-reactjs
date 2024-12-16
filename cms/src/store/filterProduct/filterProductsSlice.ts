import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IFilterProductsParams,
  ISortingPayload,
  TKeysThatAreArray,
} from './filterProductsType';
import { RootState } from '@/store';
import { INameAndId } from '../../models/Products';

interface FilterProductsState {
  filterParams: IFilterProductsParams;
}

const initialState: FilterProductsState = {
  filterParams: {
    'sort-by': [],
    sort: [],

    name: '',
    'generic-name': '',
    description: '',

    'product-classification': [],
    'product-form': [],
    manufacture: [],
  },
};

const filterProductsSlice = createSlice({
  name: 'filterProducts',
  initialState,
  reducers: {
    reset: () => initialState,
    updateSortingFilters: (state, action: PayloadAction<ISortingPayload>) => {
      const currSortBy = state.filterParams['sort-by'];
      if (!currSortBy) {
        console.log('UNDEFINED IN updateSortingFilters (sortBy)');
        return;
      }
      const currSortTypes = state.filterParams.sort;
      if (!currSortTypes) {
        console.log('UNDEFINED IN updateSortingFilters (sort)');
        return;
      }

      // skip if duplicate
      for (let i = 0; i < currSortBy.length; i++) {
        if (currSortBy[i] === action.payload.sortBy) {
          if (!currSortTypes[i]) {
            console.log('null value of currSortTypes[i]');
            return;
          }

          if (currSortTypes[i] === action.payload.sort) {
            return;
          }
        }
      }

      state.filterParams['sort-by'] = [...currSortBy, action.payload.sortBy];
      state.filterParams.sort = [...currSortTypes, action.payload.sort];
    },
    removeFromSortingFilters: (
      state,
      action: PayloadAction<ISortingPayload>,
    ) => {
      const currSortBy = state.filterParams['sort-by'];
      if (!currSortBy) {
        console.log('UNDEFINED IN removeFromSortingFilters (sortBy)');
        return;
      }
      const currSortTypes = state.filterParams.sort;
      if (!currSortTypes) {
        console.log('UNDEFINED IN removeFromSortingFilters (sort)');
        return;
      }

      for (let i = 0; i < currSortBy.length; i++) {
        if (!currSortBy[i]) return;

        if (currSortBy[i] === action.payload.sortBy) {
          if (!currSortTypes[i]) return;

          if (currSortTypes[i] === action.payload.sort) {
            state.filterParams['sort-by'] = currSortBy.filter(
              (_, idx) => idx !== i,
            );
            state.filterParams.sort = currSortTypes.filter(
              (_, idx) => idx !== i,
            );
            return;
          }
        }
      }
    },
    updateFilterParamsOnArray: (
      state,
      action: PayloadAction<{
        keyName: TKeysThatAreArray;
        item: INameAndId;
      }>,
    ) => {
      const currItems = state.filterParams[action.payload.keyName];
      if (!currItems) {
        console.log('UNDEFINED IN updateFilterParamsOnArray');
        return;
      }

      // skip if duplicate
      for (const val of currItems) {
        if (val.id === action.payload.item.id) {
          return;
        }
      }

      // push new item
      state.filterParams[action.payload.keyName] = [
        ...currItems,
        action.payload.item,
      ];
    },
    removeAnItemFromFilterParams: (
      state,
      action: PayloadAction<{
        keyName: TKeysThatAreArray;
        item: INameAndId;
      }>,
    ) => {
      const currItems = state.filterParams[action.payload.keyName];
      if (!currItems) {
        console.log('UNDEFINED IN removeAnItemFromFilterParams');
        return;
      }

      state.filterParams[action.payload.keyName] = currItems.filter((val) => {
        return val.id !== action.payload.item.id;
      });
    },
    updateFilterParams: (
      // note: good for singular value (non-array)
      state,
      action: PayloadAction<IFilterProductsParams>,
    ) => {
      state.filterParams = { ...state.filterParams, ...action.payload };
    },
  },
});

export const getFilterParams = (state: RootState) =>
  state.filterProducts.filterParams;

export const {
  reset,
  updateSortingFilters,
  removeFromSortingFilters,
  updateFilterParamsOnArray,
  removeAnItemFromFilterParams,
  updateFilterParams,
} = filterProductsSlice.actions;

export default filterProductsSlice.reducer;
