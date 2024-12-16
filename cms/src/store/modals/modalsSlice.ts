import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { IPartners } from '@/models/Partners';

interface ModalsState {
  showFilterSorting: boolean;
  showDeleteProductConfirmationModal: boolean;
  showDeletePharmacistConfirmationModal: boolean;
  showCreatePharmacistModal: boolean;
  showFilterPharmacistsModal: boolean;
  showCreatePharmaciesModal: boolean;
  showUpdatePharmaciesModal: boolean;
  showCreatePartnerModal: boolean;
  updatePartnerModalWithEntity: {
    shouldShow: boolean;
    partner: IPartners | null;
  };
  updatePharmacistOrderWithEntity: {
    shouldShow: boolean;
    orderIds: number[] | null;
    pharmacyId: number | null;
    actionType: 'CANCEL' | 'SENT' | null;
  };
}

const initialState: ModalsState = {
  showFilterSorting: false,
  showDeleteProductConfirmationModal: false,
  showDeletePharmacistConfirmationModal: false,
  showCreatePharmacistModal: false,
  showFilterPharmacistsModal: false,
  showCreatePharmaciesModal: false,
  showUpdatePharmaciesModal: false,
  showCreatePartnerModal: false,
  updatePartnerModalWithEntity: {
    shouldShow: false,
    partner: null,
  },
  updatePharmacistOrderWithEntity: {
    shouldShow: false,
    orderIds: null,
    pharmacyId: null,
    actionType: null,
  },
};

const modalsSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    reset: () => initialState,
    setShowSortModal: (state, action: PayloadAction<boolean>) => {
      state.showFilterSorting = action.payload;
    },
    setShowFilterPharmacistsModal: (state, action: PayloadAction<boolean>) => {
      state.showFilterPharmacistsModal = action.payload;
    },
    setShowDeleteProductConfirmationModal: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showDeleteProductConfirmationModal = action.payload;
    },
    setShowDeletePharmacistConfirmationModal: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showDeletePharmacistConfirmationModal = action.payload;
    },
    setShowCreatePharmacistModal: (state, action: PayloadAction<boolean>) => {
      state.showCreatePharmacistModal = action.payload;
    },
    setShowCreatePharmaciesModal: (state, action: PayloadAction<boolean>) => {
      state.showCreatePharmaciesModal = action.payload;
    },
    setShowUpdatePharmaciesModal: (state, action: PayloadAction<boolean>) => {
      state.showUpdatePharmaciesModal = action.payload;
    },
    setShowCreatePartnerModal: (state, action: PayloadAction<boolean>) => {
      state.showCreatePartnerModal = action.payload;
    },
    setUpdatePartnerModal: (state, action: PayloadAction<IPartners>) => {
      state.updatePartnerModalWithEntity.shouldShow = true;
      state.updatePartnerModalWithEntity.partner = action.payload;
    },
    dismissUpdatePartnerModal: (state) => {
      state.updatePartnerModalWithEntity.shouldShow = false;
      state.updatePartnerModalWithEntity.partner = null;
    },
    setUpdatePharmacistOrderModal: (
      state,
      action: PayloadAction<{
        orderIds: number[] | null;
        pharmacyId: number | null;
        actionType: 'CANCEL' | 'SENT' | null;
      }>,
    ) => {
      state.updatePharmacistOrderWithEntity.shouldShow = true;
      state.updatePharmacistOrderWithEntity.actionType =
        action.payload.actionType;
      state.updatePharmacistOrderWithEntity.orderIds = action.payload.orderIds;
      state.updatePharmacistOrderWithEntity.pharmacyId =
        action.payload.pharmacyId;
    },
    dismissUpdatePharmacistOrderModal: (state) => {
      state.updatePharmacistOrderWithEntity.shouldShow = false;
      state.updatePharmacistOrderWithEntity.actionType = null;
      state.updatePharmacistOrderWithEntity.orderIds = null;
      state.updatePharmacistOrderWithEntity.pharmacyId = null;
    },
  },
});

export const getModalsState = (state: RootState) => state.modals;

export const {
  reset,
  setUpdatePharmacistOrderModal,
  dismissUpdatePharmacistOrderModal,
  dismissUpdatePartnerModal,
  setUpdatePartnerModal,
  setShowCreatePartnerModal,
  setShowFilterPharmacistsModal,
  setShowCreatePharmacistModal,
  setShowCreatePharmaciesModal,
  setShowUpdatePharmaciesModal,
  setShowSortModal,
  setShowDeletePharmacistConfirmationModal,
  setShowDeleteProductConfirmationModal,
} = modalsSlice.actions;

export default modalsSlice.reducer;
