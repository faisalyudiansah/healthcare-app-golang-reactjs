import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { handleKeyDownInvalidNumber } from '@/utils/HandleKeys';
import { TPharmacyDetailsSegment } from '../PharmacyDetails';
import useFormEditProductOfPharmacy from './useFormEditProductOfPharmacy';
import { DialogClose } from '@radix-ui/react-dialog';
import { IPharmacyProduct } from '@/models/Pharmacies';
import { validateQuantity } from './validator';

export interface EditProductOfPharmacyForm {
  pharmacyId: number;
  productId: number;
  stock_quantity: number;
  is_active: boolean;
}

const EditPharmacyProduct: React.FC<{
  shouldResetDialog: boolean;
  setShouldRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  product: IPharmacyProduct;
}> = ({ shouldResetDialog, product, setShouldRefetch }) => {
  const navigate = useNavigate();
  const [thisForm, setThisForm] = useState<EditProductOfPharmacyForm>({
    pharmacyId: 0,
    productId: 0,
    stock_quantity: 0,
    is_active: true,
  });
  const { pharmacyId } = useParams<{ pharmacyId: string }>();

  const [searchParams] = useSearchParams();
  const name = searchParams.get('name');

  // RHF
  const {
    register,
    trigger,
    formState: { errors },
    getValues,
    reset,
    setError: setRHFError,
  } = useForm<EditProductOfPharmacyForm>({
    mode: 'onBlur',
    defaultValues: { stock_quantity: product.stock_quantity },
  });

  useEffect(() => {
    // reset state upon shadcn dialog dismiss
    if (shouldResetDialog) {
      setData('');
      setError('');
      setLoading(false);

      reset();
      setRHFError('root', { message: '' });
    }
  }, [shouldResetDialog]);

  const { data, error, fetchData, loading, setData, setError, setLoading } =
    useFormEditProductOfPharmacy(thisForm);

  const onClickSubmit = async () => {
    if (!(await trigger())) return;

    // proceed POST
    thisForm.stock_quantity = Number(getValues('stock_quantity'));
    thisForm.pharmacyId = Number(pharmacyId);
    thisForm.productId = product.id;
    fetchData();
  };

  let content: ReactNode;
  if (!data && !error) {
    content = (
      <>
        <DialogHeader>
          <DialogTitle className="text-2xl !mb-[-6px]">
            Edit Product
          </DialogTitle>
          <DialogDescription>
            You can edit the fields below to update your product
          </DialogDescription>
        </DialogHeader>

        <div>
          {/* QTY */}
          <div className="font-semibold text-slate-600 mt-2">Quantity</div>
          <input
            {...register('stock_quantity', {
              validate: validateQuantity,
            })}
            type="number"
            className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-4 h-10  mt-1 font-normal w-full"
            placeholder="Enter stock quantity..."
            onKeyDown={handleKeyDownInvalidNumber}
          />
          {errors.stock_quantity && (
            <div className="text-invalid-field">
              {errors.stock_quantity.message}
            </div>
          )}

          {/* IS_ACTIVE? */}
          <div className="font-semibold text-slate-600 mt-6 mb-1">
            Product Status
          </div>
          <div className="mt-0">
            <label className="inline-flex items-center me-5 cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer checked:after:text-red-50"
                checked={thisForm.is_active}
                onChange={(e) =>
                  setThisForm((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-transparent outline-none dark:peer-focus:ring-teal-800 peer-checked:after:translate-x-full  rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
              <span
                className={`select-none ms-3 text-sm font-semibold tracking-wider  dark:text-gray-300 ${
                  !thisForm.is_active ? 'text-gray-400' : 'text-gray-900'
                }`}
              >
                Activate
              </span>
            </label>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            className="text-lg py-5 text-white"
            onClick={onClickSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Save'}
          </Button>
        </DialogFooter>
      </>
    );
  } else if (data && !loading) {
    content = (
      <>
        <DialogHeader className=" flex justify-center items-center">
          <DialogTitle className="text-center w-[70%]">
            Successfully edited product
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
          <DialogTitle className="text-center w-[70%] text-2xl">
            Failed to update product
          </DialogTitle>
          <DialogDescription className="!mt-6 text-lg">
            {error}
          </DialogDescription>
        </DialogHeader>
      </>
    );
  }
  return (
    <DialogContent className="sm:max-w-[525px] px-8 pt-[40px]">
      {content}
    </DialogContent>
  );
};

export default EditPharmacyProduct;
