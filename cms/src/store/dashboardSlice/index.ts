import { formatDate } from '@/lib/format';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Pharmacy {
  id: number;
  name: string;
}

export interface ProductCategory {
  name: string;
  total_product_price: string;
  total_item: number;
}

export interface ProductClassification {
  name: string;
  total_product_price: string;
  total_item: number;
}

export interface Products {
  categories: ProductCategory[];
  classifications: ProductClassification[];
}

export interface Data {
  pharmacy: Pharmacy;
  products: Products;
}

export interface Paging {
  page: number;
  size: number;
  total_item: number;
  total_page: number;
}

export interface ReportResponse {
  message: string;
  data: Data[];
  paging: Paging;
}

export interface DashboardState {
  pharmacy: { id: number; name: string }[];
  startDate: string;
  endDate: string;
}

const initialState: DashboardState = {
  pharmacy: [],
  startDate: formatDate(new Date()),
  endDate: formatDate(new Date(new Date().setDate(new Date().getDate() + 30))),
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    reset: () => initialState,
    addPharmacy: (
      state,
      action: PayloadAction<{ pharmacyId: number; name: string }>,
    ) => {
      const { pharmacyId, name } = action.payload;

      const isExist = state.pharmacy.some((item) => item.id === pharmacyId);

      if (!isExist) {
        const newPharmacy = [...state.pharmacy, { id: pharmacyId, name: name }];
        return { ...state, pharmacy: newPharmacy };
      }

      return { ...state };
    },
    removePharmacy: (state, action: PayloadAction<{ pharmacyId: number }>) => {
      const { pharmacyId } = action.payload;

      const newState = state.pharmacy.filter(
        (pharmacy) => pharmacy.id !== pharmacyId,
      );

      return { ...state, pharmacy: newState };
    },
    addStartDate: (state, action: PayloadAction<{ date: string }>) => {
      const { date } = action.payload;

      return { ...state, startDate: date };
    },
    addEndDate: (state, action: PayloadAction<{ date: string }>) => {
      const { date } = action.payload;

      return { ...state, endDate: date };
    },
  },
});

export const { addPharmacy, removePharmacy, addStartDate, addEndDate, reset } =
  dashboardSlice.actions;
export default dashboardSlice.reducer;
