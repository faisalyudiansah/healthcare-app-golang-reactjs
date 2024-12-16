import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import useFormAddProductToPharmacy from './useFormAddProductToPharmacy';
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  handleKeyDownForPrice,
  handleKeyDownInvalidNumber,
} from '@/utils/HandleKeys';
import {
  getNumberFromFormattedString,
  validatePrice,
  validateQuantity,
} from './validator';
import { toRpFormattedShort } from '@/utils/CurrencyFormatter';
import PharmacySearcher from '@/components/PharmacySearcher';
import { TPharmacyDetailsSegment } from '../PharmacyDetails';

export interface AddProductToPharmacyForm {
  pharmacyId: number;
  product_id: number;
  stock_quantity: number;
  price: string;
  is_active: boolean;
}

const AddProductToPharmacy: React.FC<{
  shouldResetDialog: boolean;
  productId: string;
}> = ({ shouldResetDialog, productId }) => {
  const navigate = useNavigate();
  const [thisForm, setThisForm] = useState<AddProductToPharmacyForm>({
    pharmacyId: 0,
    product_id: 0,
    stock_quantity: 0,
    price: '0',
    is_active: true,
  });
  const [priceString, setPriceString] = useState('');

  const { data, error, fetchData, loading, setData, setError, setLoading } =
    useFormAddProductToPharmacy(thisForm);

  // RHF
  const {
    register,
    trigger,
    formState: { errors },
    watch,
    getValues,
    reset,
    setError: setRHFError,
  } = useForm<AddProductToPharmacyForm>({ mode: 'onBlur' });

  // ERRORS
  const [shouldShowPharmacyError, setShouldShowPharmacyError] = useState(false);

  const onClickSubmit = async () => {
    if (!thisForm.pharmacyId) setShouldShowPharmacyError(true);
    if (!(await trigger()) || shouldShowPharmacyError) return;

    // proceed POST
    thisForm.product_id = Number(productId);
    thisForm.stock_quantity = Number(getValues('stock_quantity'));
    thisForm.price = String(
      getNumberFromFormattedString(getValues('price') ?? 0),
    );
    fetchData();
  };

  const handleEnterPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isNumber = /[0-9]/.test(e.target.value);
    if (!isNumber) {
      setPriceString('');
      return;
    }

    setPriceString(
      toRpFormattedShort(getNumberFromFormattedString(e.target.value)),
    );
  };

  // RESET STATE, BECAUSE OF SHADCN NOT DESTROYING VIEW ON DIALOGDISMISS
  useEffect(() => {
    if (shouldResetDialog) {
      setData('');
      setError('');
      setLoading(false);

      reset();
      setShouldShowPharmacyError(false);
      setPriceString('');
      setRHFError('root', { message: '' });
    }
  }, [shouldResetDialog]);

  let content: ReactNode;
  if (!data && !error) {
    content = (
      <>
        <DialogHeader>
          <DialogTitle className="text-2xl !mb-[-6px]">Add Product</DialogTitle>
          <DialogDescription>
            Please fill the form below to add a product to your chosen pharmacy.
          </DialogDescription>
        </DialogHeader>

        <div>
          {/* QTY */}
          <div className="font-semibold text-slate-600 mt-2">Quantity</div>
          <input
            type="number"
            {...register('stock_quantity', {
              validate: validateQuantity,
            })}
            className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-4 h-10  mt-1 font-normal w-full"
            placeholder="Enter stock quantity..."
            onKeyDown={handleKeyDownInvalidNumber}
          />
          {errors.stock_quantity && (
            <div className="text-invalid-field">
              {errors.stock_quantity.message}
            </div>
          )}

          {/* PRICE */}
          <div className="font-semibold text-slate-600 mt-4">Price</div>
          <input
            {...register('price', {
              validate: validatePrice,
            })}
            type="text"
            value={priceString}
            onChange={handleEnterPrice}
            className=" border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-4 h-10  mt-1 font-normal w-full"
            placeholder="Enter price..."
            spellCheck={false}
            onKeyDown={(e) => {
              handleKeyDownForPrice(e);
            }}
            autoComplete="off"
          />
          {errors.price && (
            <div className="text-invalid-field">{errors.price.message}</div>
          )}

          {/* PHARMACY DROPDOWN */}
          <div className="font-semibold text-slate-600 mt-5 mb-1">Pharmacy</div>
          <PharmacySearcher<AddProductToPharmacyForm>
            endpoint="/pharmacists/pharmacies"
            formHook={{ errors, label: 'pharmacyId', register, trigger, watch }}
            placeholder="Choose your pharmacy"
            onBlurCallback={() => {
              if (!thisForm.pharmacyId) {
                setShouldShowPharmacyError(true);
              }
            }}
            onClickAValueCallback={(id) => {
              setThisForm((prev) => ({
                ...prev,
                pharmacyId: id,
              }));
              setShouldShowPharmacyError(false);
            }}
            onChangeCallback={(value) => {
              if (!value) {
                setThisForm((prev) => ({
                  ...prev,
                  pharmacyId: 0,
                }));
              }
            }}
          />
          {shouldShowPharmacyError && (
            <div className="text-invalid-field">Please choose a pharmacy</div>
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
            {loading ? 'Submitting...' : 'Add Product'}
          </Button>
        </DialogFooter>
      </>
    );
  } else if (data && !loading) {
    const segment: TPharmacyDetailsSegment = 'products';
    content = (
      <>
        <DialogHeader className=" flex justify-center items-center">
          <DialogTitle className="text-center w-[70%]">
            Successfully added the product to pharmacy
          </DialogTitle>
        </DialogHeader>

        <DialogFooter className="mt-[-20px] !flex !justify-center !items-center w-full">
          <button
            className="cta-btn-2"
            onClick={() =>
              navigate(`/pharmacies/${productId}?segment=${segment}`)
            }
          >
            See products
          </button>
        </DialogFooter>
      </>
    );
  } else {
    content = (
      <>
        <DialogHeader className=" flex justify-center items-center">
          <DialogTitle className="text-center w-[70%] text-2xl">
            Failed to add product
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

export default AddProductToPharmacy;
