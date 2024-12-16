import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import {
  AddProductForm,
  AddProductState,
  CreateProductCategory,
  ProgressDetail,
  ProgressStatus,
} from './createProductsTypes';

const initialForm: AddProductForm = {
  categories: [{}], // FILL 1 EMPTY OBJECT TO RENDER MINIMUM 1 <input> for CtgSearcher
  classification: 0,

  productName: '',
  genericName: '',
  description: '',
  manufacturer: null,

  productForm: null,
  sellingUnit: '',
  unitInPack: '',

  thumbnailImg: null,
  firstImg: null,
  secondImg: null,
  thirdImg: null,
  shouldShow2ndImg: false,
  shouldShow3rdImg: false,

  height: 0,
  weight: 0,
  length: 0,
  width: 0,
  isActive: true, // TODO: false or true as default?
};

const progresses: ProgressDetail[] = [
  {
    step: 1,
    name: 'GIVE ME NAME - 1',
    status: 'inprogress',
  },
  {
    step: 2,
    name: 'GIVE ME NAME - 2',
    status: 'none',
  },
  {
    step: 3,
    name: 'GIVE ME NAME - 3',
    status: 'none',
  },
  {
    step: 4,
    name: 'GIVE ME NAME - 4',
    status: 'none',
  },
  {
    step: 5,
    name: 'Submit',
    status: 'none',
  },
];

// MARK: INITIAL STATE FOR SLICE
const initialState: AddProductState = {
  progresses: progresses,
  form: initialForm,
};

const createProductSlice = createSlice({
  name: 'createProduct',
  initialState,
  reducers: {
    reset: () => initialState,
    updateCreateProductForm: (state, action: PayloadAction<AddProductForm>) => {
      state.form = { ...state.form, ...action.payload };
    },
    removeCategoryOnId: (state, action: PayloadAction<number>) => {
      if (!state.form.categories) {
        console.log('undefined in removeCategoryOnId');
        return;
      }

      state.form.categories = state.form.categories.filter((_, idx) => {
        return idx !== action.payload;
      });

      if (state.form.categories.length === 0) {
        state.form.categories.push({});
      }
    },
    appendEmptyCategory: (state) => {
      if (!state.form.categories) {
        console.log('undefined in appendEmptyCategory');
        return;
      }

      state.form.categories.push({});
    },
    updateCategory: (
      state,
      action: PayloadAction<{
        onIdx: number;
        category: CreateProductCategory;
      }>,
    ) => {
      if (!state.form.categories) {
        console.log('undefined in updateCategory');
        return;
      }

      state.form.categories.forEach((c, idx) => {
        if (idx === action.payload.onIdx) {
          c.id = action.payload.category.id;
          c.name = action.payload.category.name;

          return;
        }
      });
    },
    updateProgress: (
      state,
      action: PayloadAction<{ step: number; status: ProgressStatus }>,
    ) => {
      const maxProgresses = state.progresses.length;
      if (action.payload.step === maxProgresses) {
        state.progresses[maxProgresses - 1].status = 'completed';
        return; // sdh mentok
      }

      for (let i = 0; i < state.progresses.length; i++) {
        if (state.progresses[i].step === action.payload.step) {
          state.progresses[i].status = 'completed';

          state.progresses[i + 1].status = 'inprogress';
          return;
        }
      }
    },
    redoProgress: (
      state,
      action: PayloadAction<{ step: number; status: ProgressStatus }>,
    ) => {
      if (action.payload.step === 1) {
        state.progresses[0].status = 'inprogress';
        return; // sdh mentok
      }

      for (let i = 0; i < state.progresses.length; i++) {
        if (state.progresses[i].step === action.payload.step) {
          state.progresses[i].status = 'none';

          state.progresses[i - 1].status = 'inprogress';
          return;
        }
      }
    },
    resetCreateProductState: (state) => {
      state.form = initialState.form;
      state.progresses = initialState.progresses;
    },
  },
});

export const getCreatingProductProgresses = (state: RootState) =>
  state.createProduct.progresses;
export const getCurrentCategories = (state: RootState) =>
  state.createProduct.form.categories;
export const getFormCreateProduct = (state: RootState) =>
  state.createProduct.form;

export const {
  reset,
  resetCreateProductState,
  updateCreateProductForm,
  removeCategoryOnId,
  appendEmptyCategory,
  updateCategory,
  updateProgress,
  redoProgress,
} = createProductSlice.actions;
export default createProductSlice.reducer;
