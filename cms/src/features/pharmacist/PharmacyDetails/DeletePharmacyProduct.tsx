import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReactNode, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { TPharmacyDetailsSegment } from '.';
import { DialogClose } from '@radix-ui/react-dialog';
import { IPharmacyProduct } from '@/models/Pharmacies';
import useDeleteProductOfPharmacy from './useDeleteProductOfPharmacy';

export interface EditProductOfPharmacyForm {
  pharmacyId: number;
  productId: number;
  stock_quantity: number;
  is_active: boolean;
}

const DeletePharmacyProduct: React.FC<{
  shouldResetDialog: boolean;
  setShouldRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  product: IPharmacyProduct;
}> = ({ shouldResetDialog, product, setShouldRefetch }) => {
  const navigate = useNavigate();
  const { pharmacyId } = useParams<{ pharmacyId: string }>();

  const [searchParams] = useSearchParams();
  const name = searchParams.get('name');

  // RHF

  useEffect(() => {
    // reset state upon shadcn dialog dismiss
    if (shouldResetDialog) {
      setData('');
      setError('');
      setLoading(false);
    }
  }, [shouldResetDialog]);

  const { data, error, fetchData, loading, setData, setError, setLoading } =
    useDeleteProductOfPharmacy(Number(pharmacyId ?? '0'), product.id);

  const onClickDelete = async () => {
    // proceed DELETE
    fetchData();
  };

  let content: ReactNode;
  if (!data && !error) {
    content = (
      <>
        <DialogHeader>
          <DialogTitle className="text-2xl ">Delete Product</DialogTitle>
          <DialogDescription className="text-base">
            Are you sure you want to delete
            <span className="font-semibold ">{` ${product.product.name} `}</span>
            ?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="font-semibold">
              Cancel
            </Button>
          </DialogClose>

          <Button
            type="button"
            variant="destructive"
            className=" text-white font-semibold"
            onClick={onClickDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </>
    );
  } else if (data && !loading) {
    content = (
      <>
        <DialogHeader className=" flex justify-center items-center">
          <DialogTitle className="text-center w-[70%]">
            Successfully deleted product
          </DialogTitle>
        </DialogHeader>

        <DialogFooter className="mt-[-20px] !flex !justify-center !items-center w-full">
          <DialogClose asChild>
            <button
              className="cta-btn-2"
              onClick={() => {
                const segment: TPharmacyDetailsSegment = 'products';
                navigate(
                  `/pharmacies/${pharmacyId}?name=${name}&segment=${segment}`,
                );
                setShouldRefetch(true);
              }}
            >
              Back
            </button>
          </DialogClose>
        </DialogFooter>
      </>
    );
  } else {
    content = (
      <>
        <DialogHeader className=" flex justify-center items-center">
          <DialogTitle className="text-center w-[70%] text-xl">
            Failed to delete product
          </DialogTitle>
          <DialogDescription className="!mt-6 text-base">
            {error}
          </DialogDescription>
        </DialogHeader>
      </>
    );
  }
  return (
    <DialogContent className="sm:max-w-[480px] px-8 pt-[40px]">
      {content}
    </DialogContent>
  );
};

export default DeletePharmacyProduct;
