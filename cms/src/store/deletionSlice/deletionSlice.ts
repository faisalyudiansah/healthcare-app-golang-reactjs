import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import axios, { AxiosError } from 'axios';
import { IGeneralSuccessResponse } from '../../models/SuccessResponse';

interface DeletionState {
  data: string;
  error: string;
  loading: boolean;
  deletingToId?: number | null;
  refetchCounter: number;
}

const initialState: DeletionState = {
  data: '',
  error: '',
  loading: false,
  deletingToId: undefined,
  refetchCounter: 0,
};

const deletionSlice = createSlice({
  name: 'deletion',
  initialState,
  reducers: {
    reset: () => initialState,
    resetDeletionState: (state) => {
      state.data = '';
      state.error = '';
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setData: (state, action: PayloadAction<string>) => {
      state.data = action.payload;
    },
    setDeletionId: (state, action: PayloadAction<number>) => {
      state.deletingToId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProductById.fulfilled, (state, action) => {
        if (action.payload.includes('success')) {
          state.data = action.payload;
        } else {
          state.error = action.payload;
        }
        state.loading = false;
      })
      .addCase(deleteProductById.rejected, (state, action) => {
        console.log('ERROR IN deleteProductById.rejected');
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(deletePharmacistById.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePharmacistById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = '';
        state.refetchCounter += 1;
      })
      .addCase(deletePharmacistById.rejected, (state, action) => {
        console.log('ERROR IN deleteProductById.rejected');
        state.error = action.payload as string;
        state.loading = false;
        state.data = '';
        state.deletingToId = null;
      });
  },
});

export const deleteProductById = createAsyncThunk<string, string>(
  'deletion/deleteProductById',
  async (productId: string, { rejectWithValue }) => {
    try {
      const res = await axios.delete<{ message: string }>(
        `/admin/products/${productId}`,
      );

      return res.data.message;
    } catch (e) {
      const _e = e as AxiosError;

      let message = '';
      if (_e.status && _e.status !== 500) {
        const res = _e.response?.data;
        message =
          (res as IGeneralSuccessResponse)?.message.toTitle() ??
          'Failed to get error message';
      } else {
        console.log('ERROR WITH 500 CODE:', _e.message);
        message = 'Service currently unavailable. Please try again later.';
      }

      // reject
      return rejectWithValue(message.toTitle());
    }
  },
);

export const deletePharmacistById = createAsyncThunk<string, string>(
  'auth/deletePharmacistById',
  async (pharmacistId: string, { rejectWithValue }) => {
    try {
      const res = await axios.delete<IGeneralSuccessResponse>(
        `/admin/pharmacists/${pharmacistId}`,
      );
      return res.data.message + 'kocak';
    } catch (e) {
      const _e = e as AxiosError;

      let message = '';
      if (_e.status && _e.status !== 500) {
        const res = _e.response?.data;
        message =
          (res as IGeneralSuccessResponse)?.message.toTitle() ??
          'Failed to get error message';
      } else {
        console.log('ERROR WITH 500 CODE:', _e.message);
        message = 'Service currently unavailable. Please try again later.';
      }

      // reject
      return rejectWithValue(message.toTitle());
    }
  },
);

export const {
  reset,
  resetDeletionState,
  setDeletionId,
  setLoading,
  setData,
  setError,
} = deletionSlice.actions;
export const getDeletionState = (state: RootState) => state.deletion;
export const getDeletingId = (state: RootState) => state.deletion.deletingToId;

export default deletionSlice.reducer;
