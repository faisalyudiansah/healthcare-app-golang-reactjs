import { RxCross1 } from 'react-icons/rx';
import { TWColCenterize } from '@/utils/UI/TWStrings';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { dismissUpdatePharmacistOrderModal } from '@/store/modals/modalsSlice';
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ThisState {
  data: string | null;
  error: string;
  loading: boolean;
}

const UpdateOrderModal: React.FC<{
  entity: {
    shouldShow: boolean;
    orderIds: number[] | null;
    pharmacyId: number | null;
    actionType: 'CANCEL' | 'SENT' | null;
  };
}> = ({ entity }) => {
  const { orderIds, pharmacyId, actionType } = entity;

  const dispatch = useDispatch<AppDispatch>();
  const [thisState, setThisState] = useState<ThisState>({
    data: null,
    error: '',
    loading: false,
  });

  const navigate = useNavigate();
  useEffect(() => {
    console.log(thisState);
  }, [thisState]);

  const onClickCancel = () => {
    dispatch(dismissUpdatePharmacistOrderModal());
  };

  const onClickCOntinue = () => {
    const bodyPayload = {
      order_id: orderIds,
    };

    setThisState((prev) => ({ ...prev, loading: true }));
    if (actionType === 'CANCEL') {
      axios
        .delete(`/pharmacists/pharmacies/${pharmacyId}/orders`, {
          data: bodyPayload,
        })
        .then(() => {
          setThisState((prev) => ({
            ...prev,
            data: 'success',
          }));
        })
        .catch(() =>
          setThisState((prev) => ({
            ...prev,
            error: 'error',
          })),
        )
        .finally(() => setThisState((prev) => ({ ...prev, loading: false })));
    } else if (actionType === 'SENT') {
      axios
        .put(`/pharmacists/pharmacies/${pharmacyId}/orders`, bodyPayload)
        .then(() => {
          setThisState((prev) => ({
            ...prev,
            data: 'success',
          }));
        })
        .catch(() =>
          setThisState((prev) => ({
            ...prev,
            error: 'error',
          })),
        )
        .finally(() => setThisState((prev) => ({ ...prev, loading: false })));
    }
  };

  let message: ReactNode;
  if (actionType === 'CANCEL') {
    message = (
      <div className="text-2xl font-semibold">
        Are you sure to cancel the selected orders?
      </div>
    );
  } else if (actionType === 'SENT') {
    message = (
      <div className="text-2xl font-semibold">
        Are you sure to set the selected orders to SENT?
      </div>
    );
  } else {
    message = <></>;
  }

  let content: ReactNode;
  if (!thisState.data && !thisState.error) {
    content = (
      <>
        {message}

        <div className="w-full flex justify-center items-center gap-6 mt-8 ">
          <button className="pessimist-btn-2" onClick={onClickCancel}>
            Cancel
          </button>
          <button
            className="warning-btn-1"
            onClick={onClickCOntinue}
            disabled={thisState.loading}
          >
            Continue
          </button>
        </div>
      </>
    );
  } else if (thisState.error) {
    content = <div>{'encountered error: ' + thisState.error}</div>;
  } else {
    content = (
      <>
        <div className="text-xl font-semibold">
          Successfully updated order status
        </div>

        <button
          className="cta-btn-2"
          onClick={() => {
            navigate(0);
            dispatch(dismissUpdatePharmacistOrderModal());
          }}
        >
          Back to Orders
        </button>
      </>
    );
  }

  return (
    <div
      className={`relative bg-brand-white w-[600px] h-[300px] max-h-[340px] rounded-xl ${TWColCenterize}`}
    >
      {!thisState.data && (
        <RxCross1
          className="absolute top-4 right-4 size-7 text-slate-500 cursor-pointer"
          onClick={onClickCancel}
        />
      )}

      {/* MARK: CONTENT */}
      <div className={TWColCenterize}>{content}</div>
    </div>
  );
};

export default UpdateOrderModal;
