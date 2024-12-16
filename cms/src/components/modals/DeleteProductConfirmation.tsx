import { RxCross1 } from 'react-icons/rx';
import { TWColCenterize } from '../../utils/UI/TWStrings';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { setShowDeleteProductConfirmationModal } from '../../store/modals/modalsSlice';
import {
  deleteProductById,
  getDeletionState,
  resetDeletionState,
} from '../../store/deletionSlice/deletionSlice';
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DeleteProductConfirmation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, error, loading } = useSelector(getDeletionState);

  const navigate = useNavigate();

  const { productId: productIdParam } = useParams<{ productId: string }>();
  const [productId, setProductId] = useState('');

  const onClickCancel = () => {
    dispatch(setShowDeleteProductConfirmationModal(false));
    dispatch(resetDeletionState());
  };

  const onClickDelete = () => {
    dispatch(deleteProductById(productId));
  };

  useEffect(() => {
    if (data) {
      console.log(data);
    }
  }, [data]);

  useEffect(() => {
    if (productIdParam) {
      setProductId(productIdParam);
    }
  }, [productIdParam]);

  let content: ReactNode;
  if (!data && !error) {
    content = (
      <>
        <div className="text-2xl font-semibold">Delete Product</div>
        <div>{`Are you sure you want to delete Product of ID ${productId}?`}</div>

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
        <div className="text-xl font-semibold">Delete Product</div>
        {/* <div>{`${productId}`}</div> */}
        <div className="mt-1">
          Successfully deleted product of ID{' '}
          <span className="font-semibold">{productId}</span>
        </div>

        <button
          className="cta-btn-2"
          onClick={() => {
            navigate('/products');
            dispatch(setShowDeleteProductConfirmationModal(false));
            dispatch(resetDeletionState());
          }}
        >
          Back to Products
        </button>
      </>
    );
  }

  return (
    <div
      className={`relative bg-brand-white w-[600px] h-[300px] max-h-[340px] rounded-xl ${TWColCenterize}`}
    >
      {!data && (
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

export default DeleteProductConfirmation;
