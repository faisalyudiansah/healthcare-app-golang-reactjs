import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProductState {
  query: string;
  productClassifications: number[];
  sort: string;
  sortBy: string;
}

const initialState: ProductState = {
  query: "",
  productClassifications: [],
  sort: "",
  sortBy: "",
};

export const productSlices = createSlice({
  name: "product",
  initialState,
  reducers: {
    changeQuery: (state, action: PayloadAction<{ query: string }>) => {
      return { ...state, query: action.payload.query };
    },
    addClassification: (
      state,
      action: PayloadAction<{ classification: number }>
    ) => {
      const { classification } = action.payload;

      state.productClassifications.push(classification);
    },
    removeClassification: (
      state,
      action: PayloadAction<{ classification: number }>
    ) => {
      const { classification } = action.payload;

      const newClassification = state.productClassifications.filter(
        (item) => item !== classification
      );
      
      return { ...state, productClassifications: newClassification };
    },
    addSortOpt: (state, action: PayloadAction<{ sortOpt: string }>) => {
      const [sortBy, sort] = action.payload.sortOpt.split(" ");

      return { ...state, sort, sortBy };
    },
  },
});

export const {
  changeQuery,
  addClassification,
  removeClassification,
  addSortOpt,
} = productSlices.actions;
export default productSlices.reducer;
