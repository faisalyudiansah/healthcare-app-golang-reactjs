import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

const initialState: { filter: string } = {
  filter: '',
};

const filterAdminOrdersSlice = createSlice({
  name: 'filterPharmacists',
  initialState,
  reducers: {
    reset: () => initialState,
    setAdminOrdersFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
    removeAdminOrdersFilter: (state) => {
      state.filter = '';
    },
  },
});

export const { reset, setAdminOrdersFilter, removeAdminOrdersFilter } =
  filterAdminOrdersSlice.actions;

export const getFilterAdminOrders = (state: RootState) =>
  state.filterAdminOrders.filter;

export default filterAdminOrdersSlice.reducer;
