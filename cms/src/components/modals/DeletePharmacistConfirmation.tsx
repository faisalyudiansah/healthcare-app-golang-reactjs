import { RxCross1 } from 'react-icons/rx';
import { TWColCenterize } from '../../utils/UI/TWStrings';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { setShowDeletePharmacistConfirmationModal } from '../../store/modals/modalsSlice';
import {
  deletePharmacistById,
  getDeletingId,
  getDeletionState,
  resetDeletionState,
} from '../../store/deletionSlice/deletionSlice';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const DeletePharmacistConfirmation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const pharmacistId = useSelector(getDeletingId);
  const { data, error, loading } = useSelector(getDeletionState);

  const navigate = useNavigate();

  const onClickCancel = () => {
    dispatch(setShowDeletePharmacistConfirmationModal(false));
    dispatch(resetDeletionState());
  };

  const onClickDelete = () => {
    if (!pharmacistId) return;

    dispatch(deletePharmacistById(String(pharmacistId)));
  };

  let content: ReactNode;
  if (!data && !error) {
    content = (
      <>
        <div className="text-2xl font-semibold">Delete Pharmacist</div>
        <div>{`Are you sure you want to delete Pharmacist ${pharmacistId}?`}</div>

        <div className="w-full flex justify-center items-center gap-6 mt-8 ">
          <button className="pessimist-btn-2" onClick={onClickCancel}>
            Cancel
          </button>
          <button
            className="warning-btn-1"
            onClick={onClickDelete}
            disabled={loading}
          >
            Delete
          </button>
        </div>
      </>
    );
  } else if (error) {
    content = <div>{'encountered error: ' + error}</div>;
  } else {
    content = (
      <>
        <div className="text-xl font-semibold">Delete Pharmacist</div>
        <div className="mt-1">
          Successfully deleted a Pharmacist of ID{' '}
          <span className="font-semibold">{pharmacistId}</span>
        </div>

        <button
          className="mt-6 border-2 border-primary2 py-2 px-4 rounded-md font-medium text-slate-700 hover:bg-primary2 hover:text-slate-100 transition-colors"
          onClick={() => {
            navigate(0);
            dispatch(setShowDeletePharmacistConfirmationModal(false));
            dispatch(resetDeletionState());
          }}
        >
          Back to Pharmacists List
        </button>
      </>
    );
  }

  return (
    <div
      className={`relative bg-brand-white w-[600px] h-[300px] max-h-[340px] rounded-xl ${TWColCenterize}`}
    >
      <RxCross1
        className="absolute top-4 right-4 size-7 text-slate-500 cursor-pointer"
        onClick={onClickCancel}
      />

      {/* MARK: CONTENT */}
      <div className={TWColCenterize}>{content}</div>
    </div>
  );
};

export default DeletePharmacistConfirmation;
