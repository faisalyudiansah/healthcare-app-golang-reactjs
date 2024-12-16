import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getModalsState } from '@/store/modals/modalsSlice';

const OverlayPlain: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const modalsState = useSelector(getModalsState);

  useEffect(() => {
    if (
      modalsState.showDeletePharmacistConfirmationModal ||
      modalsState.showDeleteProductConfirmationModal ||
      modalsState.showCreatePharmacistModal
    ) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [modalsState]);
  return (
    <div className="h-full bg-overlay overlay-fadein z-40 fixed inset-0 flex justify-center items-center">
      {children}
    </div>
  );
};

export default OverlayPlain;
