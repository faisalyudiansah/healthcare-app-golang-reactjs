import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Address {
  id: number;
  user_id: number;
  is_active: boolean;
  address: string;
  province: string;
  city_id: number;
  city: string;
  district: string;
  sub_district: string;
  latitude: string;
  longitude: string;
  contact_name: string;
  contact_phone_number: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingRequest {
  pharmacy_id: number;
  address_id: number | undefined;
  origin: number | undefined;
  destination: number;
  weight: number;
}

export interface CheckoutRequest {
  address_id: number | undefined;
  pharmacy_id: number;
  description: string | undefined;
  order_products: OrderProduct[];
  ship_cost: number;
}

export interface ShippingOption {
  code: string;
  service: string;
  estimation: string;
  ship_cost: string;
}

export interface OrderProduct {
  pharmacy_product_id: number;
  quantity: number;
  price: number;
}

export interface CheckoutItems {
  [pharmacyId: number]: {
    selected: boolean;
    cost: number;
    products: OrderProduct[];
    description?: string;
  };
}

export interface CheckoutState {
  address: Address | null;
  checkoutItems: CheckoutItems;
}

const initialState: CheckoutState = {
  address: null,
  checkoutItems: {},
};

export const checkoutSlices = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<{ address: Address }>) => {
      return { ...state, address: action.payload.address };
    },
    initCheckoutItem: (
      state,
      action: PayloadAction<{
        checkoutItems: {
          pharmacyId: number;
          products: OrderProduct[];
          description?: string;
        }[];
      }>
    ) => {
      const { checkoutItems } = action.payload;
      const newState: CheckoutItems = {};

      checkoutItems.forEach((item) => {
        newState[item.pharmacyId] = {
          selected: false,
          cost: 0,
          products: item.products,
        };

        if (state.checkoutItems[item.pharmacyId]) {
          const prevDesc = state.checkoutItems[item.pharmacyId].description;

          newState[item.pharmacyId].description =
            item.description ?? prevDesc ?? " ";
        }
      });

      return { ...state, checkoutItems: newState };
    },
    addShipCost: (
      state,
      action: PayloadAction<{ pharmacyId: number; cost: number }>
    ) => {
      const { pharmacyId, cost } = action.payload;

      if (state.checkoutItems[pharmacyId]) {
        state.checkoutItems[pharmacyId].selected = true;
        state.checkoutItems[pharmacyId].cost = cost;
      }
    },
    clearCheckoutItem: (state) => {
      return { ...state, checkoutItems: {} };
    },
    addDescription: (
      state,
      action: PayloadAction<{ pharmacyId: number; description: string }>
    ) => {
      const { pharmacyId, description } = action.payload;

      if (state.checkoutItems[pharmacyId]) {
        state.checkoutItems[pharmacyId].description = description;
      }
    },
  },
});

export const {
  setAddress,
  initCheckoutItem,
  addShipCost,
  clearCheckoutItem,
  addDescription,
} = checkoutSlices.actions;
export default checkoutSlices.reducer;
