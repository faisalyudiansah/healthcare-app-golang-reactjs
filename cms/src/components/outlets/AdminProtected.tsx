import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { getModalsState, setShowSortModal } from '@/store/modals/modalsSlice';
import OverlayPlain from '../ui/Overlay/OverlayPlain';
import DeleteProductConfirmation from '../modals/DeleteProductConfirmation';
import DeletePharmacistConfirmation from '../modals/DeletePharmacistConfirmation';
import OverlayBlurred from '../ui/Overlay/OverlayBlurred';
import AddPharmacist from '@/features/admin/AddPharmacist';
import Sidebar from '../layouts/Sidebar';
import AddPartner from '@/features/admin/AddPartner';
import UpdatePartner from '@/features/admin/UpdatePartner';
import UpdateOrderModal from '../modals/UpdateOrderModal';
import AddPharmacies from '@/features/admin/AddPharmacies';
import UpdatePharmacies from '@/features/admin/UpdatePharmacies';

const AdminProtected = () => {
  const dispatch = useDispatch<AppDispatch>();
  const modalsState = useSelector(getModalsState);

  const handleClick = () => {
    // dispatch all modals here
    if (modalsState.showFilterSorting) {
      dispatch(setShowSortModal(false));
    }
  };

  return (
    <div
      // className="w-full relative bg-brand-gray flex justify-start items-start h-full"
      className="w-full bg-brand-gray flex h-screen"
      onClick={handleClick}
    >
      <Sidebar />
      <Outlet />

      {/* MARK: CONFIRMATION MODAL */}
      {modalsState.showDeleteProductConfirmationModal && (
        <OverlayPlain>
          <DeleteProductConfirmation />
        </OverlayPlain>
      )}

      {modalsState.showDeletePharmacistConfirmationModal && (
        <OverlayPlain>
          <DeletePharmacistConfirmation />
        </OverlayPlain>
      )}

      {modalsState.showCreatePharmacistModal && (
        <OverlayBlurred>
          <AddPharmacist />
        </OverlayBlurred>
      )}

      {modalsState.showCreatePharmaciesModal && (
        <OverlayBlurred>
          <AddPharmacies />
        </OverlayBlurred>
      )}

      {modalsState.showUpdatePharmaciesModal && (
        <OverlayBlurred>
          <UpdatePharmacies />
        </OverlayBlurred>
      )}

      {modalsState.showCreatePartnerModal && (
        <OverlayBlurred>
          <AddPartner />
        </OverlayBlurred>
      )}

      {modalsState.updatePartnerModalWithEntity.shouldShow &&
        modalsState.updatePartnerModalWithEntity.partner && (
          <OverlayBlurred>
            <UpdatePartner
              partner={modalsState.updatePartnerModalWithEntity.partner}
            />
          </OverlayBlurred>
        )}

      {modalsState.updatePharmacistOrderWithEntity.shouldShow && (
        <OverlayBlurred>
          <UpdateOrderModal
            entity={modalsState.updatePharmacistOrderWithEntity}
          />
        </OverlayBlurred>
      )}
    </div>
  );
};

export default AdminProtected;
