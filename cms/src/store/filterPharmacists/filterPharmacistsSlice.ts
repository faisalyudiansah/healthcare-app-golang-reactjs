import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IFilterPharmacists,
  IFilterPharmacistsText,
  IFilterPharmacistsYOERange,
} from './filterPharmacistsType';
import { RootState } from '@/store';

const initialState: IFilterPharmacists = {
  filters: [],
};

const filterPharmacistsSlice = createSlice({
  name: 'filterPharmacists',
  initialState,
  reducers: {
    reset: () => initialState,
    appendTextFieldFilterPharmacists: (
      state,
      action: PayloadAction<IFilterPharmacistsText>,
    ) => {
      // update if already exists
      for (const val of state.filters) {
        if (val.type === 'textfield') {
          const thisVal = val.value as IFilterPharmacistsText;
          if (thisVal.name === action.payload.name) {
            thisVal.value = action.payload.value;
            return;
          }
        }
      }

      // append new
      state.filters = [
        ...state.filters,
        {
          type: 'textfield',
          value: action.payload,
        },
      ];
    },
    removeOneTextFieldPharmacistsFilter: (
      state,
      action: PayloadAction<IFilterPharmacistsText>,
    ) => {
      state.filters = state.filters.filter((d) => {
        if (d.type === 'textfield') {
          const thisFilter = d.value as IFilterPharmacistsText;
          return thisFilter.name !== action.payload.name;
        } else if (d.type === 'yoe') {
          return true; // todo more
        }
      });
    },
    appendYOERangeFilterPharmacist: (
      state,
      action: PayloadAction<IFilterPharmacistsYOERange>,
    ) => {
      for (let i = 0; i < state.filters.length; i++) {
        if (state.filters[i].type === 'yoe') {
          (state.filters[i].value as IFilterPharmacistsYOERange).minYoe =
            action.payload.minYoe;
          (state.filters[i].value as IFilterPharmacistsYOERange).maxYoe =
            action.payload.maxYoe;
          return;
        }
      }

      state.filters = [
        ...state.filters,
        {
          type: 'yoe',
          value: action.payload,
        },
      ];
    },
    removeYOERangeFilterPharmacist: (state) => {
      state.filters = state.filters.filter((d) => {
        return d.type !== 'yoe';
      });
    },
  },
});

export const {
  reset,
  appendYOERangeFilterPharmacist,
  appendTextFieldFilterPharmacists,
  removeOneTextFieldPharmacistsFilter,
  removeYOERangeFilterPharmacist,
} = filterPharmacistsSlice.actions;

export const getFilterPharmacists = (state: RootState) =>
  state.filterPharmacists.filters;

export default filterPharmacistsSlice.reducer;
