import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Paging {
  page: number;
  size: number;
  total_item: number;
  total_page: number;
}

export interface Partner {
  id: number;
  name: string;
  logo_url: string;
  year_founded: string;
  active_days: string;
  start_operation: string;
  end_operation: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductDetails {
  id: number;
  manufacture_id: number;
  product_classification_id: number;
  product_form_id: number | null;
  name: string;
  generic_name: string;
  description: string;
  unit_in_pack: string;
  selling_unit: string;
  sold_amount: number;
  weight: string;
  height: string;
  length: string;
  width: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductInfo {
  id: number;
  quantity_in_cart: number;
  stock_quantity: number;
  price: string;
  products: ProductDetails;
}

export interface PharmacyInfo {
  id: number;
  pharmacist_id: number;
  partner_id: number;
  partner: Partner;
  name: string;
  address: string;
  city_id: number;
  city: string;
  latitude: string;
  longitude: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PharmacyProductData {
  sold_amount: number;
  total_price_per_pharmacy: string;
  pharmacy_info: PharmacyInfo;
  products_info: ProductInfo[];
}

export interface CartItem {
  user_id: number;
  total_price: string;
  data_pharmacy_products: PharmacyProductData;
  created_at: string;
  updated_at: string;
}

export interface CartResponse {
  message: string;
  data: CartItem[];
  paging: Paging;
}

export interface CartState {
  location: "cart" | "checkout";
  count: number;
  rerender: boolean;
  selectAll: boolean;
  pharmacies: {
    [pharmacyId: number]: {
      checked: boolean;
      info: PharmacyInfo;
      products: {
        [productId: number]: {
          checked: boolean;
          quantity: number;
          info: ProductInfo;
        };
      };
    };
  };
}

const initialState: CartState = {
  location: "cart",
  count: 0,
  pharmacies: {},
  selectAll: false,
  rerender: false,
};

export const cartSlices = createSlice({
  name: "cart",
  initialState: initialState,
  reducers: {
    changeLocation: (
      state,
      action: PayloadAction<{ location: "cart" | "checkout" }>
    ) => {
      return { ...state, location: action.payload.location };
    },
    initCart: (state, action: PayloadAction<CartResponse>) => {
      state.count = action.payload.data.reduce(
        (sum, item) =>
          sum +
          item.data_pharmacy_products.products_info.reduce(
            (pharmacySum, product) => pharmacySum + product.quantity_in_cart,
            0
          ),
        0
      );
      state.pharmacies = {};
      action.payload.data.forEach((item) => {
        const pharmacyId = item.data_pharmacy_products.pharmacy_info.id;

        state.pharmacies[pharmacyId] = {
          checked: false,
          info: item.data_pharmacy_products.pharmacy_info,
          products: {},
        };

        item.data_pharmacy_products.products_info.forEach((product) => {
          state.pharmacies[pharmacyId].products[product.id] = {
            checked: false,
            quantity: product.quantity_in_cart,
            info: product,
          };
        });
      });
    },
    initCartCount: (state, action: PayloadAction<{ count: number }>) => {
      return { ...state, count: action.payload.count };
    },
    addToCart: (state) => {
      return { ...state, count: state.count + 1 };
    },
    removeFromCart: (state) => {
      return { ...state, count: state.count - 1 };
    },
    toggleProductCheck: (
      state,
      action: PayloadAction<{ pharmacyId: number; productId: number }>
    ) => {
      const { pharmacyId, productId } = action.payload;
      const product = state.pharmacies[pharmacyId].products[productId];
      product.checked = !product.checked;

      state.pharmacies[pharmacyId].checked = Object.values(
        state.pharmacies[pharmacyId].products
      ).every((product) => product.checked);
    },
    togglePharmacyCheck: (
      state,
      action: PayloadAction<{ pharmacyId: number }>
    ) => {
      const { pharmacyId } = action.payload;
      const pharmacy = state.pharmacies[pharmacyId];
      pharmacy.checked = !pharmacy.checked;

      Object.values(pharmacy.products).forEach((product) => {
        product.checked = pharmacy.checked;
      });
    },
    toggleSelectAll: (state) => {
      const allPharmacyChecked = Object.values(state.pharmacies).every(
        (pharmacies) => pharmacies.checked
      );

      const allProductChecked = Object.values(state.pharmacies)
        .map((pharmacy) => {
          return Object.values(pharmacy.products).every(
            (product) => product.checked
          );
        })
        .every((checked) => checked);

      state.selectAll = allPharmacyChecked && allProductChecked;
    },
    selectAll: (state) => {
      Object.values(state.pharmacies).forEach((pharmacy) => {
        pharmacy.checked = true;
        Object.values(pharmacy.products).forEach((product) => {
          product.checked = true;
        });
      });
      state.selectAll = true;
    },
    unselectAll: (state) => {
      Object.values(state.pharmacies).forEach((pharmacy) => {
        pharmacy.checked = false;
        Object.values(pharmacy.products).forEach((product) => {
          product.checked = false;
        });
      });
      state.selectAll = false;
    },
    addQuantity: (
      state,
      action: PayloadAction<{ pharmacyId: number; productId: number }>
    ) => {
      const { pharmacyId, productId } = action.payload;

      state.pharmacies[pharmacyId].products[productId].quantity++;
    },
    minusQuantity: (
      state,
      action: PayloadAction<{ pharmacyId: number; productId: number }>
    ) => {
      const { pharmacyId, productId } = action.payload;

      state.pharmacies[pharmacyId].products[productId].quantity--;
    },
    removeProduct: (
      state,
      action: PayloadAction<{ pharmacyId: number; productId: number }>
    ) => {
      const { pharmacyId, productId } = action.payload;

      delete state.pharmacies[pharmacyId].products[productId];
      state.rerender = !state.rerender;
    },
  },
});

export const {
  changeLocation,
  initCart,
  initCartCount,
  addToCart,
  removeFromCart,
  toggleProductCheck,
  togglePharmacyCheck,
  toggleSelectAll,
  selectAll,
  unselectAll,
  addQuantity,
  minusQuantity,
  removeProduct,
} = cartSlices.actions;
export default cartSlices.reducer;
