import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getModalsState } from '../../../store/modals/modalsSlice';

const OverlayBlurred: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const modalsState = useSelector(getModalsState);

  useEffect(() => {
    if (
      modalsState.showDeletePharmacistConfirmationModal ||
      modalsState.showDeleteProductConfirmationModal ||
      modalsState.showCreatePharmacistModal ||
      modalsState.showCreatePartnerModal ||
      modalsState.updatePartnerModalWithEntity.shouldShow
    ) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [modalsState]);

  return (
    <div className="bg-overlay h-full overlay-fadein z-40 fixed inset-0 flex justify-center items-center">
      {children}
    </div>
  );
};

export default OverlayBlurred;
