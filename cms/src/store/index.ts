import { configureStore } from '@reduxjs/toolkit';
import createProductReducer from './createProduct/createProductSlice';
import filterProductsReducer from './filterProduct/filterProductsSlice';
import modalsReducer from './modals/modalsSlice';
import deletionReducer from './deletionSlice/deletionSlice';
import toastReducer from './toast/toastSlice';
import authReducer from './authentication/authSlice';
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import filterPharmacistsReducer from './filterPharmacists/filterPharmacistsSlice';
import filterAdminOrdersReducer from './filterAdminOrders/filterAdminOrdersSlice';
import dashboardSlice from './dashboardSlice/index';
import pharmacyReducer from './pharmacies/pharmaciesSlice';

// const persistedReducer = persistReducer(
//   { key: 'xácthực', storage },
//   authReducer,
// );

export const store = configureStore({
  reducer: {
    dashboard: dashboardSlice,
    createProduct: createProductReducer,
    filterProducts: filterProductsReducer,
    modals: modalsReducer,
    deletion: deletionReducer,
    toast: toastReducer,
    filterPharmacists: filterPharmacistsReducer,
    filterAdminOrders: filterAdminOrdersReducer,
    auth: authReducer,
    pharmacies: pharmacyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['actionWithFilePayload'],
        ignoredActionPaths: [
          'payload.errors.0',
          'register',
          'rehydrate',
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    }),
});

// export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
