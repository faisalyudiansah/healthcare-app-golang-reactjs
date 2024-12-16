import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/store';

type ToastType = 'warning' | 'success' | null;

interface ToastState {
  shouldShow?: boolean;
  type: ToastType;
  message: string;
}

const initialState: ToastState = {
  shouldShow: false,
  type: null,
  message: '',
};

const toastSlice = createSlice({
  name: 'toast',
  initialState: initialState,
  reducers: {
    showToast: (state, action: PayloadAction<ToastState>) => {
      state.type = action.payload.type;
      state.shouldShow = true;
      state.message = action.payload.message;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(showToastAsync.pending, (state) => {
        state.shouldShow = true;
      })
      .addCase(showToastAsync.fulfilled, (state) => {
        state.shouldShow = false;
      });
  },
});

export const showToastAsync = createAsyncThunk(
  'toast/showToastAsync',
  async (state: ToastState, { dispatch }) => {
    dispatch(showToast(state));
    await new Promise((r) => setTimeout(r, 2500));
    return;
  },
);

export const getToastShouldShow = (state: RootState) => state.toast.shouldShow;
export const { showToast } = toastSlice.actions;
export default toastSlice.reducer;
