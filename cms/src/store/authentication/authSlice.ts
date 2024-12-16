import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ICredentials, TSignInResponse } from '../../models/Authentication';
import axios, { AxiosError } from 'axios';
import { IUser } from '../../models/Users';
import { RootState } from '..';

export interface AuthState {
  dauHieu: string | null;
  error: string;
  loading: boolean;
  isVerified: boolean;
  user: IUser | null;
}

const initialState: AuthState = {
  isVerified: false,
  dauHieu: null,
  error: '',
  loading: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.isVerified = false;
      state.error = '';
      state.loading = false;
      state.dauHieu = '';
      state.user = null;
    },
    setLoginVerification: (state, action: PayloadAction<boolean>) => {
      state.isVerified = action.payload;
    },
    setUserDetails: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = '';
        state.user = null;
        state.dauHieu = '';
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.dauHieu = action.payload.data.access_token;
        state.isVerified = true;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isVerified = false;
      });
  },
});

export const signIn = createAsyncThunk<TSignInResponse, ICredentials>(
  'auth/signIn',
  async (credentials: ICredentials, { rejectWithValue }) => {
    try {
      const res = await axios.post<TSignInResponse>(
        '/auth/login',
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return res.data;
    } catch (e) {
      const _e = e as AxiosError;

      let message = '';
      if (_e.status && _e.status !== 500) {
        const res = _e.response?.data;
        message =
          (res as TSignInResponse)?.message.toTitle() ??
          'Failed to get error messaage';
      } else {
        console.log('ERROR WITH 500 CODE:', _e.message);
        message = 'Service currently unavailable. Please try again later.';
      }

      // reject
      return rejectWithValue(message.toTitle());
    }
  },
);

export const { resetAuthState, setLoginVerification, setUserDetails } =
  authSlice.actions;
export const getAuthState = (state: RootState) => state.auth;
export default authSlice.reducer;
