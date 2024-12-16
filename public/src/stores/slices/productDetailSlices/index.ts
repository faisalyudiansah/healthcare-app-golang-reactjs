import { createSlice } from "@reduxjs/toolkit";

export interface ProductDetailState {
  pharmacyProductId: number | null;
  price: string | number | null;
  stock: number | null;
  pharmacy: {
    id: number;
    pharmacist: {
      id: number;
      name: string;
      sipa_number: string;
    };
    name: string;
    address: string;
  } | null;
}

const initialState: ProductDetailState = {
  pharmacyProductId: null,
  price: null,
  stock: null,
  pharmacy: null,
};

export const productDetailSlice = createSlice({
  name: "productDetail",
  initialState,
  reducers: {
    changeDetail: (_, action) => {
      return { ...action.payload };
    },
  },
});

export const { changeDetail } = productDetailSlice.actions;
export default productDetailSlice.reducer;
