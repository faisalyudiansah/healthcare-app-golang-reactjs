import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlices";
import productDetailReducer from "./slices/productDetailSlices";
import cartReducer from "./slices/cartSlices";
import checkoutReducer from "./slices/checkoutSlices";
import authReducer from "./slices/authSlices/authSlice";
import addressReducer from "./slices/addressSlices/addressSlice";
import clusterReducer from './slices/addressSlices/clusterSlice';

const store = configureStore({
  reducer: {
    authReducer,
    product: productReducer,
    productDetail: productDetailReducer,
    cart: cartReducer,
    addressReducer,
    clusterReducer,
    checkout: checkoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
