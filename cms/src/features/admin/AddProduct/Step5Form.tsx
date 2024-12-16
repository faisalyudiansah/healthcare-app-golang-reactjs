import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  getFormCreateProduct,
  redoProgress,
  resetCreateProductState,
  updateProgress,
} from '@/store/createProduct/createProductSlice';
import axios, { AxiosError } from 'axios';
import DrugClassificationSummary from './components/DrugClassificationSummary';
import ImgPreviewSummary from './components/ImgPreviewSummary';
import { showToastAsync } from '@/store/toast/toastSlice';
import { useNavigate } from 'react-router-dom';

interface ThisStateProps {
  success: boolean;
  data: string;
  error: string;
  loading: boolean;
}
const initialState: ThisStateProps = {
  success: false,
  data: '',
  error: '',
  loading: false,
};

const Step5Form = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const currCreateProductForm = useSelector(getFormCreateProduct);

  const handleBack = () => {
    dispatch(redoProgress({ step: 5, status: 'none' }));
  };
  const handleNext = () => {
    submitForm();
  };

  const [shouldShowProductExistsErr, setShouldShowProductExistsErr] =
    useState(false);
  const [thisState, setThisState] = useState<ThisStateProps>(initialState);
  const isLoading = thisState.loading;
  const [didSuccessCreateProduct, setDidSuccessCreateProduct] = useState(false);

  useEffect(() => {
    if (thisState.data && !thisState.error && !isLoading) {
      setDidSuccessCreateProduct(true);
    } else {
      setDidSuccessCreateProduct(false);
    }
  }, [thisState, isLoading]);

  useEffect(() => {
    if (thisState.error) {
      dispatch(showToastAsync({ message: thisState.error, type: 'warning' }));
      setShouldShowProductExistsErr(true);
      setThisState((prev) => ({ ...prev, success: false }));
      return;
    }

    if (thisState.data.toLowerCase().includes('success')) {
      dispatch(
        showToastAsync({
          message: 'Successfully created a new product',
          type: 'success',
        }),
      );
      dispatch(updateProgress({ step: 5, status: 'completed' }));
      setShouldShowProductExistsErr(false);
      setThisState((prev) => ({ ...prev, success: true }));
    }
  }, [thisState.data, thisState.error]);

  const submitForm = () => {
    const categoryIds: string[] =
      currCreateProductForm.categories?.map((c) => {
        return String(c.id ?? 0);
      }) ?? [];

    const formData = new FormData();
    formData.append('name', currCreateProductForm.productName ?? '');
    formData.append('generic_name', currCreateProductForm.genericName ?? '');
    formData.append('description', currCreateProductForm.description ?? '');
    formData.append(
      'manufacture_id',
      String(currCreateProductForm.manufacturer?.id ?? -1),
    );
    formData.append(
      'product_classification_id',
      String(currCreateProductForm.classification ?? -1),
    );
    formData.append(
      'product_form_id',
      String(currCreateProductForm.productForm?.id ?? -1),
    );
    formData.append('selling_unit', currCreateProductForm.sellingUnit ?? '');
    formData.append('unit_in_pack', currCreateProductForm.unitInPack ?? '');
    formData.append('weight', String(currCreateProductForm.weight ?? 0));
    formData.append('height', String(currCreateProductForm.height ?? 0));
    formData.append('length', String(currCreateProductForm.length ?? 0));
    formData.append('width', String(currCreateProductForm.width ?? 0));
    formData.append(
      'is_active',
      String(currCreateProductForm.isActive ?? false),
    );
    formData.append('thumbnail', currCreateProductForm.thumbnailImg!);
    formData.append('image', currCreateProductForm.firstImg!);
    formData.append('secondary_image', currCreateProductForm.secondImg!);
    formData.append('tertiary_image', currCreateProductForm.thirdImg!);
    for (const ctgId of categoryIds) {
      formData.append('product_categories', ctgId);
    }
    formData.append('is_active', String(currCreateProductForm.isActive));

    // proceed fetching
    setThisState({
      ...initialState,
      loading: true,
    });
    axios
      .postForm<{ message: string }>('/admin/products', formData)
      .then((res) => {
        setThisState((prev) => ({
          ...prev,
          data: res.data.message,
        }));
      })
      .catch((e: AxiosError) =>
        setThisState((prev) => ({
          ...prev,
          error: (e.response?.data as { message: string }).message.toTitle(),
        })),
      )
      .finally(() => {
        setThisState((prev) => ({
          ...prev,
          loading: false,
        }));
      });
  };

  return (
    <div className="w-[1000px] h-full min-h-[580px] pt-8 flex flex-col justify-start items-start ">
      <div className="font-semibold text-xl">
        {thisState.success ? 'Successfully created new product' : 'Summary'}
      </div>

      {/* name */}
      <div className="font-medium text-slate-700 mt-6 mb-[-3px]">Name :</div>
      <div>{currCreateProductForm.productName}</div>

      {/* generic */}
      <div className="font-medium text-slate-700 mt-6 mb-[-3px]">
        Generic Name :
      </div>
      <div>{currCreateProductForm.genericName}</div>

      {/* description */}
      <div className="font-medium text-slate-700 mt-6">Description :</div>
      <div className="w-[700px] max-h-[140px] break-words overflow-y-scroll pr-6">
        {currCreateProductForm.description}
      </div>

      {/* drug clf */}
      <div className="font-medium text-slate-700 mt-6 mb-1">
        Drug Classification :
      </div>
      <DrugClassificationSummary
        drugClf={currCreateProductForm.classification ?? 1}
      />

      {/* manufacturer */}
      <div className="font-medium text-slate-700 mt-4 mb-1">Manufacturer :</div>
      <div className="bg-yellow-100 text-yellow-700 font-medium px-4 py-1 rounded-full">
        {currCreateProductForm.manufacturer?.name}
      </div>

      {/* categories */}
      <div className="font-medium text-slate-700 mt-4 mb-1">Categories :</div>
      <div className="flex justify-start items-center gap-2 overflow-x-scroll">
        {currCreateProductForm.categories?.map((ctg) => (
          <div className="bg-green-200 text-green-800 font-medium px-4 py-1 rounded-full">
            {ctg.name}
          </div>
        ))}
      </div>

      {/* form, sellinunit, unitinpack */}
      <div className="font-medium text-slate-700 mt-4 mb-1">Product Form :</div>
      <div className="w-fit bg-blue-100 text-blue-700 font-medium px-4 py-1 rounded-full">
        {currCreateProductForm.productForm?.name}
      </div>
      <div className="flex justify-start items-start gap-16 mt-2">
        <div>
          <div className="font-medium text-slate-700 mt-4 mb-[-4px]">
            Selling Unit :
          </div>
          <div className="">{currCreateProductForm.sellingUnit}</div>
        </div>
        <div>
          <div className="font-medium text-slate-700 mt-4 mb-[-4px]">
            Unit in Pack :
          </div>
          <div className="">{currCreateProductForm.unitInPack}</div>
        </div>
      </div>

      {/* images */}
      <div className="font-medium text-slate-700 mt-8 mb-1">Images :</div>
      <div className="flex justify-start items-start gap-5 overflow-scroll p-4 bg-slate-50 rounded-xl">
        <ImgPreviewSummary
          imgFile={currCreateProductForm.thumbnailImg as File}
        />
        <ImgPreviewSummary imgFile={currCreateProductForm.firstImg as File} />
        {currCreateProductForm.secondImg && (
          <ImgPreviewSummary
            imgFile={currCreateProductForm.secondImg as File}
          />
        )}
        {currCreateProductForm.thirdImg && (
          <ImgPreviewSummary imgFile={currCreateProductForm.thirdImg as File} />
        )}
      </div>

      {/* measurements */}
      <div className="grid grid-cols-[repeat(2,148px)] grid-rows-[repeat(2,62px)] gap-4 justify-start">
        <div>
          <div className="font-medium text-slate-700 mt-8 mb-[-3px]">
            Weight :
          </div>
          <div className="flex justify-start items-center gap-1.5">
            <span className="text-lg font-bold text-slate-600">
              {currCreateProductForm.weight}
            </span>
            <span className="text-primary2 font-medium">grams</span>
          </div>
        </div>

        <div>
          <div className="font-medium text-slate-700 mt-8 mb-[-3px]">
            Length :
          </div>
          <div className="flex justify-start items-center gap-1.5">
            <span className="text-lg font-bold text-slate-600">
              {currCreateProductForm.length}
            </span>
            <span className="text-primary2 font-medium">cm</span>
          </div>
        </div>

        <div>
          <div className="font-medium text-slate-700 mt-8 mb-[-3px]">
            Width :
          </div>
          <div className="flex justify-start items-center gap-1.5">
            <span className="text-lg font-bold text-slate-600">
              {currCreateProductForm.width}
            </span>
            <span className="text-primary2 font-medium">cm</span>
          </div>
        </div>

        <div>
          <div className="font-medium text-slate-700 mt-8 mb-[-3px]">
            Height :
          </div>
          <div className="flex justify-start items-center gap-1.5">
            <span className="text-lg font-bold text-slate-600">
              {currCreateProductForm.height}
            </span>
            <span className="text-primary2 font-medium">cm</span>
          </div>
        </div>
      </div>

      {/* status (is_active) */}
      <div className="flex justify-start items-center gap-2 mt-10 mb-16">
        <div className="font-medium text-slate-700 ">Product Status :</div>
        <div
          className={`px-3 py-1 rounded-full font-semibold ${
            currCreateProductForm.isActive
              ? 'bg-green-200 text-green-600'
              : 'bg-red-200 text-red-600'
          }`}
        >
          {currCreateProductForm.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* MARK: show additional error below */}
      {shouldShowProductExistsErr && (
        <div className="text-invalid-field w-full text-right">
          {'Product with this details already exists. Please try changing the '}
          <span className="font-semibold">Name</span>
          {', '}
          <span className="font-semibold">Generic Name</span>, and the{' '}
          <span className="font-semibold">Manufacturer</span>.
        </div>
      )}

      {/* BOTTOM BUTTONS */}
      {didSuccessCreateProduct ? (
        <div className="flex flex-col justify-start items-end w-full">
          <div className="mb-[-14px] text-lg font-semibold">
            Successfully created new product.
          </div>
          <button
            className="cta-btn-2 mb-8"
            onClick={() => {
              navigate('/products');
              dispatch(resetCreateProductState());
            }}
          >
            See Products List
          </button>
        </div>
      ) : (
        <div className="w-full mt-4 mb-8 flex justify-end items-center gap-4">
          <button className="form-pessimist-btn" onClick={handleBack}>
            BACK
          </button>
          <button
            className="form-optimist-btn"
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'SUBMIT'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Step5Form;
