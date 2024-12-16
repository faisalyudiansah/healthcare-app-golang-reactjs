import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';
import { INameAndId } from '@/models/Products';

interface filterField {
  name: string
  partner: INameAndId
  pharmacist: INameAndId
}

interface PharmacyState {
  selectedPharmacy: number | undefined;
  filter: filterField;
}

const initialState: PharmacyState = {
  selectedPharmacy: 0, // Initialize with 0 since nothing is selected initially
  filter: {
    name: '',
    partner: { id: 0, name: ''},
    pharmacist: { id: 0, name: ''},
  }, // Initialize filter as an empty string
};

const pharmacySlice = createSlice({
  name: 'pharmacies',
  initialState,
  reducers: {
    reset: () => initialState,
    setSelectedPharmacy: (state, action: PayloadAction<number | undefined>) => {
      state.selectedPharmacy = action.payload;  // Update selectedPharmacy in the state
    },
    setPharmaciesFilterName: (state, action: PayloadAction<string>) => {
      state.filter.name = action.payload;  // Update filter
    },
    removePharmaciesFilterName: (state) => {
      state.filter.name = '';  // Reset filter
    },
    setPharmaciesFilterPartner: (state, action: PayloadAction<INameAndId>) => {
      state.filter.partner = action.payload;  // Update filter
    },
    removePharmaciesFilterPartner: (state) => {
      state.filter.partner = initialState.filter.partner;  // Reset filter
    },
    setPharmaciesFilterPhramacist: (state, action: PayloadAction<INameAndId>) => {
      state.filter.pharmacist = action.payload;  // Update filter
    },
    removePharmaciesFilterPhramacist: (state) => {
      state.filter.pharmacist = initialState.filter.pharmacist;  // Reset filter
    },
  },
});

// Export the actions
export const { reset, setSelectedPharmacy, setPharmaciesFilterName, removePharmaciesFilterName, setPharmaciesFilterPartner,
  removePharmaciesFilterPartner, setPharmaciesFilterPhramacist,
  removePharmaciesFilterPhramacist } = pharmacySlice.actions;

// Selectors
export const selectedPharmacyStore = (state: RootState) => state.pharmacies.selectedPharmacy;
export const getFilterPharmacies = (state: RootState): filterField => state.pharmacies.filter;

// Export the reducer
export default pharmacySlice.reducer;
