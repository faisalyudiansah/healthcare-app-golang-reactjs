import { RxCross1 } from 'react-icons/rx';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAxios from '@/hooks/useAxios';
import { IProductDetails } from '@/models/Products';
import IBaseResponse from '@/models/IBaseResponse';
import { TWCenterize, TWColCenterize } from '@/utils/UI/TWStrings';
import TextareaAutosize from 'react-textarea-autosize';
import InputWithUnitStyle from '@/components/ui/InputWithUnitStyle';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { setShowDeleteProductConfirmationModal } from '@/store/modals/modalsSlice';
import StyledImageUploader from '@/components/ui/StyledImageUploader';
import { useForm } from 'react-hook-form';
import { FiPlus } from 'react-icons/fi';
import useFormUpdateProduct from './useFormUpdateProduct';
import { showToastAsync } from '@/store/toast/toastSlice';
import { IoArrowBackOutline } from 'react-icons/io5';
import AddProductToPharmacy from '@/features/pharmacist/AddProduct/AddProductToPharmacy';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { IUser } from '@/models/Users';
import PharmacySearcher from '@/components/PharmacySearcher';
import {
  useUpdateProductCtgs,
  useUpdateManufacturer,
  useUpdateProductForm,
} from './useUpdateDropdowns';
import ProductClfDisplay from './ProductClfDisplay';
import drugClassifications from '@/models/DrugClassifications';
import ProductClfUpdateCheckbox from './ProductClfUpdateCheckbox';

const subTitle = 'text-lg font-semibold';

export interface ThisForm {
  name: string;
  generic_name: string;
  description: string;

  manufacture_id: number;
  product_classification_id: number;
  product_form_id: number;
  product_categories: number[];

  unit_in_pack: string;
  selling_unit: string;

  weight: string;
  height: string;
  width: string;
  length: string;

  is_active: boolean;

  thumbnail: File | null;
  image: File | null;
  secondary_image: File | null;
  tertiary_image: File | null;
}

const ProductDetails = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useAuthUser<IUser>();
  const role: 'pharmacist' | 'admin' = user?.role ?? 'admin';

  const { productId } = useParams<{ productId: string }>();

  const [isUpdating, setIsUpdating] = useState(false);
  const [thisForm, setThisForm] = useState<ThisForm>({
    description: '',
    generic_name: '',
    height: '',
    width: '',
    weight: '',
    length: '',
    is_active: true,
    manufacture_id: 0,
    name: '',
    product_categories: [],
    product_classification_id: 0,
    product_form_id: 0,
    selling_unit: '',
    unit_in_pack: '',
    image: null,
    thumbnail: null,
    secondary_image: null,
    tertiary_image: null,
  });

  const endpoint =
    role === 'admin'
      ? `/admin/products/${productId}`
      : `/pharmacists/products/${productId}`;
  const { fetchData, error, loading, data } =
    useAxios<IBaseResponse<IProductDetails>>(endpoint);
  const {
    fetchData: fetchUpdateProduct,
    loading: loadingUpdateProduct,
    error: errorUpdateProduct,
    data: dataUpdateProduct,
    didSuccess,
  } = useFormUpdateProduct(thisForm);

  useEffect(() => {
    if (didSuccess) {
      fetchData();
    }
  }, [didSuccess]);

  // CUSTOMHOOK: PRODUCT CTGS
  const { ctgs, setCtgs } = useUpdateProductCtgs(
    data?.data.product_categories ?? [],
  );
  const { manu, setManu } = useUpdateManufacturer(
    data?.data.manufacture ?? { id: 0, name: '' },
  );
  const { productForm, setProductForm } = useUpdateProductForm(
    data?.data.product_form ?? { id: 0, name: '' },
  );
  const [chosenDrugClfId, setChosenDrugClfId] = useState(
    data?.data.product_classification.id ?? 0,
  );

  useEffect(() => {
    if (productId) {
      fetchData();
    }
  }, [productId]);

  // MARK: HANDLE ONCLICKS
  const navigate = useNavigate();
  const handleOnClickAbort = () => {
    if (isUpdating) {
      setIsUpdating(false);
      // hide 2 additional imgs
      setShouldShow2ndImg(false);
      setShouldShow3rdImg(false);
    } else {
      navigate('/products');
    }
  };
  const handleClickUpdateOrSave = async () => {
    if (!isUpdating) {
      setIsUpdating(true);
      return;
    }

    if (
      !(await trigger()) ||
      dimensionErrs.heightErr ||
      dimensionErrs.lengthErr ||
      dimensionErrs.weightErr ||
      dimensionErrs.widthErr ||
      ctgs.length === 0 ||
      !productForm.name ||
      !manu.name ||
      chosenDrugClfId === 0 ||
      shouldShowPNGThumbErr ||
      shouldShowPNG1stImgErr ||
      shouldShowPNG2ndImgErr ||
      shouldShowPNG3rdImgErr ||
      shouldShowValidThumbErr ||
      shouldShowValid1stImgErr ||
      shouldShowValid2ndImgErr ||
      shouldShowValid3rdImgErr
    ) {
      dispatch(
        showToastAsync({
          message: 'Please fill in the invalid fields',
          type: 'warning',
        }),
      );
      return;
    }

    if (!sellingUnitRef.current) return;
    if (!unitInPackRef.current) return;
    if (!lengthRef.current) return;
    if (!heightRef.current) return;
    if (!widthRef.current) return;
    if (!weightRef.current) return;
    if (!descriptionRef.current) return;
    if (!genericNameRef.current) return;
    if (!nameRef.current) return;

    if (!data) return;
    thisForm.name = nameRef.current.value;
    thisForm.generic_name = genericNameRef.current.value;
    thisForm.description = descriptionRef.current.value;
    thisForm.weight = weightRef.current.value;
    thisForm.width = widthRef.current.value;
    thisForm.height = heightRef.current.value;
    thisForm.length = lengthRef.current.value;
    thisForm.unit_in_pack = unitInPackRef.current.value;
    thisForm.selling_unit = sellingUnitRef.current.value;

    thisForm.product_categories = ctgs.map((d) => d.id);
    thisForm.manufacture_id = manu.id;
    thisForm.product_form_id = productForm.id;
    thisForm.product_classification_id = chosenDrugClfId;

    fetchUpdateProduct(productId ?? '0'); // proceed fetch
  };

  const handleCLickDelete = () => {
    dispatch(setShowDeleteProductConfirmationModal(true));
  };

  // MARK: REFS FOR TEXT INPUTS
  const nameRef = useRef<HTMLInputElement>(null);
  const genericNameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const widthRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);
  const lengthRef = useRef<HTMLInputElement>(null);
  const unitInPackRef = useRef<HTMLInputElement>(null);
  const sellingUnitRef = useRef<HTMLInputElement>(null);
  const image1Ref = useRef<HTMLImageElement>(null);
  const thumbnailRef = useRef<HTMLImageElement>(null);

  // PREFILL
  useEffect(() => {
    if (!data) return;

    if (nameRef.current) {
      nameRef.current.value = data.data.name;
    }
    if (genericNameRef.current) {
      genericNameRef.current.value = data.data.generic_name;
    }
    if (descriptionRef.current) {
      descriptionRef.current.value = data.data.description;
    }
    if (weightRef.current) {
      weightRef.current.value = data.data.weight;
    }
    if (widthRef.current) {
      widthRef.current.value = data.data.width;
    }
    if (heightRef.current) {
      heightRef.current.value = data.data.height;
    }
    if (lengthRef.current) {
      lengthRef.current.value = data.data.length;
    }
    if (unitInPackRef.current) {
      unitInPackRef.current.value = data.data.unit_in_pack;
    }
    if (sellingUnitRef.current) {
      sellingUnitRef.current.value = data.data.selling_unit;
    }

    // remove all previous warnings
    trigger();
    setDimensionErrs({
      heightErr: '',
      lengthErr: '',
      widthErr: '',
      weightErr: '',
    });

    // prefill ctgs, form, manufacturer
    setCtgs(data.data.product_categories);
    setManu(data.data.manufacture);
    setProductForm(data.data.product_form);
    setChosenDrugClfId(data.data.product_classification.id);
  }, [data, isUpdating]);

  const {
    register,
    trigger,
    formState: { errors },
    watch,
  } = useForm<ThisForm>({ mode: 'onBlur' });

  const [dimensionErrs, setDimensionErrs] = useState<{
    lengthErr: string;
    widthErr: string;
    heightErr: string;
    weightErr: string;
  }>({ heightErr: '', lengthErr: '', widthErr: '', weightErr: '' });

  // MARK: ADD MORE IMAGES
  const [shouldShow2ndImg, setShouldShow2ndImg] = useState(false);
  const [shouldShow3rdImg, setShouldShow3rdImg] = useState(false);
  const handleClickAddMoreImgs = () => {
    if (!shouldShow2ndImg) {
      setShouldShow2ndImg(true);
      return;
    }
    if (!shouldShow3rdImg) {
      setShouldShow3rdImg(true);
    }
  };

  // MARK: IMAGE ERRORS
  const [shouldShowPNGThumbErr, setShouldShowPNGThumbErr] = useState(false);

  const [shouldShowPNG1stImgErr, setShouldShowPNG1stImgErr] = useState(false);

  const [shouldShowPNG2ndImgErr, setShouldShowPNG2ndImgErr] = useState(false);

  const [shouldShowPNG3rdImgErr, setShouldShowPNG3rdImgErr] = useState(false);

  const [shouldShowValidThumbErr, setShouldShowValidThumbErr] = useState(false);

  const [shouldShowValid1stImgErr, setShouldShowValid1stImgErr] =
    useState(false);

  const [shouldShowValid2ndImgErr, setShouldShowValid2ndImgErr] =
    useState(false);

  const [shouldShowValid3rdImgErr, setShouldShowValid3rdImgErr] =
    useState(false);

  useEffect(() => {
    if (dataUpdateProduct.includes('success') && !errorUpdateProduct) {
      dispatch(
        showToastAsync({
          message: 'Successfully updated product',
          type: 'success',
        }),
      );
      setIsUpdating(false);
      return;
    }

    if (errorUpdateProduct) {
      dispatch(
        showToastAsync({ message: errorUpdateProduct, type: 'warning' }),
      );
    }
  }, [dataUpdateProduct, errorUpdateProduct]);

  // ADD PRODUCT TO PHAMARCIST'S PHARMACY
  const [shouldResetDialog, setShouldResetDialog] = useState(false);

  let content: ReactNode;
  if (error) {
    content = <div>Product is not found</div>;
  } else if (!data || loading) {
    content = <div>loading...</div>;
  } else {
    // NOTE: every component has an explicit container of "px-12"
    content = (
      <div className="container px-12 py-6 pb-20">
        <div className="p-6 w-full bg-white ">
          {/* MARK: HEADER */}
          <div className="flex justify-start items-center gap-3 mb-6">
            <div
              className={`${TWCenterize} cursor-pointer  size-11`}
              onClick={() => navigate('/products')}
            >
              <IoArrowBackOutline className="text-slate-300 size-10" />
            </div>
            <div className="text-2xl font-semibold">Product Details</div>
          </div>

          {/* MARK: PRODUCT PHOTOS */}
          <div className="px-14">
            <div className={subTitle}>Product Photos</div>
            <div className="flex justify-start items-center gap-12 w-full h-[268px] mt-2 mb-6">
              {!isUpdating ? (
                <div className={`${TWColCenterize} w-[240px] h-full `}>
                  <img
                    src={data.data.thumbnail_url}
                    className="border-[2px] border-slate-00 rounded-lg object-cover w-full h-full overflow-hidden"
                    alt=""
                    ref={thumbnailRef}
                  />
                  <div className="text-sm font-medium mt-2">Thumbnail</div>
                </div>
              ) : (
                <div className="flex flex-col justify-start items-center">
                  <StyledImageUploader<ThisForm>
                    title="Thumbnail"
                    formSetter={setThisForm}
                    completionHandler={(file) => {
                      setThisForm((prev) => ({
                        ...prev,
                        thumbnail: file,
                      }));
                    }}
                    formHook={{
                      errors,
                      label: 'thumbnail',
                      register,
                      trigger,
                      watch,
                    }}
                    onTypeOfPng={(isPng) => {
                      setShouldShowPNGThumbErr(!isPng);
                    }}
                    onValidSize={(isValid) => {
                      setShouldShowValidThumbErr(!isValid);
                    }}
                    imageUrl={data.data.thumbnail_url}
                  />
                  {errors.thumbnail && (
                    <div className="text-invalid-field">
                      Thumbnail is required
                    </div>
                  )}
                  {shouldShowPNGThumbErr && (
                    <div className="text-invalid-field">
                      Only PNG Image is allowed
                    </div>
                  )}
                  {shouldShowValidThumbErr && (
                    <div className="text-invalid-field text-center">
                      Image's size must be less than 500kB
                    </div>
                  )}
                </div>
              )}

              {!isUpdating ? (
                <div className={`${TWColCenterize} w-[240px] h-full`}>
                  <img
                    src={data.data.image_url}
                    className="border-[2px] border-slate-00 rounded-lg object-cover w-full h-full overflow-hidden"
                    alt=""
                    ref={image1Ref}
                  />
                  <div className="text-sm font-medium mt-2">Image 1</div>
                </div>
              ) : (
                <div className="flex flex-col justify-start items-center">
                  <StyledImageUploader<ThisForm>
                    title="Image"
                    formSetter={setThisForm}
                    completionHandler={(file) => {
                      setThisForm((prev) => ({
                        ...prev,
                        image: file,
                      }));
                    }}
                    formHook={{
                      errors,
                      label: 'image',
                      register,
                      trigger,
                      watch,
                    }}
                    onTypeOfPng={(isPng) => {
                      setShouldShowPNG1stImgErr(!isPng);
                    }}
                    onValidSize={(isValid) => {
                      setShouldShowValid1stImgErr(!isValid);
                    }}
                    imageUrl={data.data.image_url}
                  />
                  {errors.image && (
                    <div className="text-invalid-field">
                      At least 1 image is required
                    </div>
                  )}
                  {shouldShowPNG1stImgErr && (
                    <div className="text-invalid-field">
                      Only PNG Image is allowed
                    </div>
                  )}
                  {shouldShowValid1stImgErr && (
                    <div className="text-invalid-field text-center">
                      Image's size must be less than 500kB
                    </div>
                  )}
                </div>
              )}

              {isUpdating && shouldShow2ndImg && (
                <div className="flex flex-col justify-start items-center">
                  <StyledImageUploader<ThisForm>
                    title="Upload Image"
                    additionalTitle="(Optional)"
                    formSetter={setThisForm}
                    additionalImgHook={{
                      getter: shouldShow2ndImg,
                      setter: setShouldShow2ndImg,
                    }}
                    formHook={{
                      errors,
                      label: 'secondary_image',
                      register,
                      trigger,
                      watch,
                    }}
                    onTypeOfPng={(isPng) => {
                      setShouldShowPNG2ndImgErr(!isPng);
                    }}
                    onValidSize={(isValid) => {
                      setShouldShowValid2ndImgErr(!isValid);
                    }}
                    completionHandler={(file) => {
                      setThisForm((prev) => ({
                        ...prev,
                        secondary_image: file,
                      }));
                    }}
                  />
                  {shouldShowPNG2ndImgErr && (
                    <div className="text-invalid-field">
                      Only PNG Image is allowed
                    </div>
                  )}
                  {shouldShowValid2ndImgErr && (
                    <div className="text-invalid-field text-center">
                      Image's size must be less than 500kB
                    </div>
                  )}
                </div>
              )}

              {isUpdating && shouldShow3rdImg && (
                <div className="flex flex-col justify-start items-center">
                  <StyledImageUploader<ThisForm>
                    title="Upload Image"
                    additionalTitle="(Optional)"
                    formSetter={setThisForm}
                    additionalImgHook={{
                      getter: shouldShow3rdImg,
                      setter: setShouldShow3rdImg,
                    }}
                    formHook={{
                      errors,
                      label: 'tertiary_image',
                      register,
                      trigger,
                      watch,
                    }}
                    onTypeOfPng={(isPng) => {
                      setShouldShowPNG3rdImgErr(!isPng);
                    }}
                    onValidSize={(isValid) => {
                      setShouldShowValid3rdImgErr(!isValid);
                    }}
                    completionHandler={(file) => {
                      setThisForm((prev) => ({
                        ...prev,
                        tertiary_image: file,
                      }));
                    }}
                  />
                  {shouldShowPNG3rdImgErr && (
                    <div className="text-invalid-field">
                      Only PNG Image is allowed
                    </div>
                  )}
                  {shouldShowValid3rdImgErr && (
                    <div className="text-invalid-field text-center">
                      Image's size must be less than 500kB
                    </div>
                  )}
                </div>
              )}

              {isUpdating && (!shouldShow2ndImg || !shouldShow3rdImg) && (
                <div
                  className="product-add-more-images"
                  onClick={handleClickAddMoreImgs}
                >
                  <FiPlus className="size-5" />
                  <div>Add more images</div>
                </div>
              )}
            </div>
          </div>

          {/* MARK: IS ACTIVE */}
          <div className="px-12 flex justify-start items-center mt-3">
            {data.data.is_active ? (
              <div className="text-sm font-medium text-center italic p-2 px-3 bg-green-100 text-green-600 rounded-full">
                This product is active
              </div>
            ) : (
              <div className="text-sm font-medium text-center italic p-2 px-3 bg-red-100 text-red-500 rounded-full">
                This product is not active
              </div>
            )}
          </div>

          {/* MARK: SOLD */}
          <div className="px-12 mt-2 mb-6">
            <div className="text-lg font-medium">
              Sold:{' '}
              <span className="text-primary">{data.data.sold_amount}</span>
            </div>
          </div>

          {/* MARK: NAME & GENERICNAME */}
          <div className="px-12 flex justify-start items-start gap-8 w-full ">
            {/* NAME */}
            <div className=" w-[40%] max-w-[551px]">
              <div className={subTitle + ' mb-1'}>Name</div>
              <input
                disabled={!isUpdating}
                {...register('name', {
                  validate: () => {
                    if (!nameRef.current) return false;
                    if (!nameRef.current.value) return 'Name is required';
                    return true;
                  },
                })}
                ref={nameRef}
                type="text"
                className={`input-text-canhide`}
              />
              {isUpdating && errors.name && (
                <div className="text-invalid-field">{errors.name.message}</div>
              )}
            </div>

            {/* GENERIC NAME */}
            <div className=" w-[50%] max-w-[674px]">
              <div className={subTitle + ' mb-1'}>Generic Name</div>
              <input
                disabled={!isUpdating}
                {...register('generic_name', {
                  validate: () => {
                    if (!genericNameRef.current) return false;
                    if (!genericNameRef.current.value)
                      return 'Generic Name is required';
                    return true;
                  },
                })}
                ref={genericNameRef}
                type="text"
                className={`input-text-canhide`}
              />
              {isUpdating && errors.generic_name && (
                <div className="text-invalid-field">
                  {errors.generic_name.message}
                </div>
              )}
            </div>
          </div>

          {/* MARK: DESCRIPTION*/}
          <div className="px-12 w-full">
            <div className={subTitle + ' mt-6 '}>Description</div>
            <TextareaAutosize
              {...register('description', {
                validate: () => {
                  if (!descriptionRef.current) return false;
                  if (!descriptionRef.current.value)
                    return 'Description is required';
                  return true;
                },
              })}
              ref={descriptionRef}
              className={`input-textarea-canhide resize-none`}
              minRows={!isUpdating ? 0 : 5}
              maxRows={5}
              disabled={!isUpdating}
            />
            {isUpdating && errors.description && (
              <div className="text-invalid-field">
                {errors.description.message}
              </div>
            )}
          </div>

          {/* MARK: DIMENSION */}
          <div className="px-12  w-full ">
            <div className={subTitle + ' mt-6'}>Dimension</div>
            <div
              className={`flex justify-start items-start gap-16 w-full ${
                isUpdating && 'mt-2'
              }`}
            >
              {/* LENGTH */}
              <div className="w-[20%]">
                <div className="flex justify-start items-center">
                  Length:
                  {isUpdating ? (
                    <InputWithUnitStyle
                      unit="cm"
                      ref={lengthRef}
                      onBlurCb={(d) => {
                        if (!d) {
                          setDimensionErrs((prev) => ({
                            ...prev,
                            lengthErr: 'Length is required',
                          }));
                        } else {
                          setDimensionErrs((prev) => ({
                            ...prev,
                            lengthErr: '',
                          }));
                        }
                      }}
                    />
                  ) : (
                    <>
                      <span className="ml-2 mr-1 font-medium text-lg">
                        {data.data.length}
                      </span>
                      <span className="ml-1 text-primary font-semibold italic">
                        cm
                      </span>
                    </>
                  )}
                </div>
                {isUpdating && dimensionErrs.lengthErr && (
                  <div className="text-invalid-field">
                    {dimensionErrs.lengthErr}
                  </div>
                )}
              </div>

              {/* WIDTH */}
              <div className="w-[20%]">
                <div className="flex justify-start items-center">
                  Width:
                  {isUpdating ? (
                    <InputWithUnitStyle
                      unit="cm"
                      ref={widthRef}
                      onBlurCb={(d) => {
                        if (!d) {
                          setDimensionErrs((prev) => ({
                            ...prev,
                            widthErr: 'Width is required',
                          }));
                        } else {
                          setDimensionErrs((prev) => ({
                            ...prev,
                            widthErr: '',
                          }));
                        }
                      }}
                    />
                  ) : (
                    <>
                      <span className="ml-2 mr-1 font-medium text-lg">
                        {data.data.width}
                      </span>
                      <span className="ml-1 text-primary font-semibold italic">
                        cm
                      </span>
                    </>
                  )}
                </div>
                {isUpdating && dimensionErrs.widthErr && (
                  <div className="text-invalid-field">
                    {dimensionErrs.widthErr}
                  </div>
                )}
              </div>

              <div className="w-[20%]">
                <div className="flex justify-start items-center">
                  Height:
                  {isUpdating ? (
                    <InputWithUnitStyle
                      unit="cm"
                      ref={heightRef}
                      onBlurCb={(d) => {
                        if (!d) {
                          setDimensionErrs((prev) => ({
                            ...prev,
                            heightErr: 'Height is required',
                          }));
                        } else {
                          setDimensionErrs((prev) => ({
                            ...prev,
                            heightErr: '',
                          }));
                        }
                      }}
                    />
                  ) : (
                    <>
                      <span className="ml-2 mr-1 font-medium text-lg">
                        {data.data.height}
                      </span>
                      <span className="ml-1 text-primary font-semibold italic">
                        cm
                      </span>
                    </>
                  )}
                </div>
                {isUpdating && dimensionErrs.heightErr && (
                  <div className="text-invalid-field">
                    {dimensionErrs.heightErr}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MARK: WEIGHT */}
          <div className="px-12  w-full ">
            <div className={`${subTitle} mt-6 ${isUpdating && 'mb-2'}`}>
              Weight
            </div>
            <div className={`flex justify-normal items-center $`}>
              {!isUpdating ? (
                <>
                  <span className="mr-1 font-medium text-lg text-slate-600">
                    {data.data.weight}
                  </span>
                  <span className="ml-1 text-primary font-semibold italic">
                    grams
                  </span>
                </>
              ) : (
                <div className="w-[16%]">
                  <InputWithUnitStyle
                    unit="cm"
                    ref={weightRef}
                    onBlurCb={(d) => {
                      if (!d) {
                        setDimensionErrs((prev) => ({
                          ...prev,
                          weightErr: 'Weight is required',
                        }));
                      } else {
                        setDimensionErrs((prev) => ({
                          ...prev,
                          weightErr: '',
                        }));
                      }
                    }}
                  />
                  {isUpdating && dimensionErrs.weightErr && (
                    <div className="text-invalid-field">
                      {dimensionErrs.weightErr}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MARK: SELLING_UNIT & UNIT_INPACK */}
          <div
            className={
              'px-12 w-full mt-6 flex justify-start items-start gap-16 '
            }
          >
            <div>
              <div className={`${subTitle} ${isUpdating && ' mb-2'}`}>
                Unit in Pack
              </div>
              {isUpdating ? (
                <div>
                  <input
                    {...register('unit_in_pack', {
                      validate: () => {
                        if (!unitInPackRef.current) return false;
                        if (!unitInPackRef.current.value)
                          return 'Unit in Pack is required';
                        return true;
                      },
                    })}
                    disabled={!isUpdating}
                    ref={unitInPackRef}
                    type="text"
                    className={`input-text-canhide`}
                  />
                  {errors.unit_in_pack && (
                    <div className="text-invalid-field">
                      {errors.unit_in_pack.message}
                    </div>
                  )}
                </div>
              ) : (
                <div>{data.data.unit_in_pack}</div>
              )}
            </div>
            <div>
              <div className={`${subTitle} ${isUpdating && ' mb-2'}`}>
                Selling Unit
              </div>
              {isUpdating ? (
                <div>
                  <input
                    {...register('selling_unit', {
                      validate: () => {
                        if (!sellingUnitRef.current) return false;
                        if (!sellingUnitRef.current.value)
                          return 'Selling Unit is required';
                        return true;
                      },
                    })}
                    disabled={!isUpdating}
                    ref={sellingUnitRef}
                    type="text"
                    className={`input-text-canhide`}
                  />
                  {errors.selling_unit && (
                    <div className="text-invalid-field">
                      {errors.selling_unit.message}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>{data.data.selling_unit}</div>
                </>
              )}
            </div>
          </div>

          {/* CLASIFFCIATION */}
          <div className={'px-12 mt-6'}>
            <div className={subTitle}>Product Classification</div>
            {!isUpdating ? (
              <ProductClfDisplay id={data.data.product_classification.id} />
            ) : (
              <div className="flex justify-start items-start gap-4 h-12">
                {[...Array(4).keys()].map((idx) => (
                  <ProductClfUpdateCheckbox
                    id={idx + 1}
                    key={idx}
                    chosenId={chosenDrugClfId}
                    onChanceCb={(i) => {
                      setChosenDrugClfId(i);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {data.data.product_classification.id !== 4 && (
            <>
              {/* MARK: MANUFACTURER */}
              <div className={'px-12 mt-6'}>
                <div className={subTitle}>Manufacturer</div>
                <div className="flex">
                  {!isUpdating ? (
                    <div className="bg-yellow-100 py-[6px] px-4 text-yellow-600 font-semibold rounded-full text-sm cursor-default">
                      {data.data.manufacture.name}
                    </div>
                  ) : (
                    manu.name && (
                      <div className="bg-yellow-100 py-[6px] px-4 text-yellow-600 font-semibold rounded-full text-sm cursor-default flex justify-start items-center gap-1">
                        {manu.name}
                        <RxCross1
                          className="size-4 cursor-pointer"
                          onClick={() => {
                            setManu({ id: 0, name: '' });
                          }}
                        />
                      </div>
                    )
                  )}
                </div>
                {isUpdating && (
                  <div className="w-[40%] mt-1">
                    <PharmacySearcher<ThisForm>
                      withoutLabel={true}
                      endpoint="/products/manufactures"
                      placeholder="Search for Manufacturers"
                      formHook={{
                        errors,
                        label: 'manufacture_id',
                        register,
                        trigger,
                        watch,
                      }}
                      onClickAValueCallback={(id, name) => {
                        if (manu.id === id) return;
                        setManu({ id, name });
                      }}
                    />
                  </div>
                )}
                {isUpdating && !manu.id && !manu.name && (
                  <>
                    <div className="text-invalid-field">
                      Please enter a Manufacturer
                    </div>
                  </>
                )}
              </div>

              {/* MARK: PROD CATEGORIES */}
              <div className={'px-12 w-full mt-6'}>
                <div className={subTitle}>Product Categories</div>
                <div className=" flex justify-start items-start gap-2 mt-2 flex-wrap w-[70%]  overflow-scroll pr-2 mb-1">
                  {!isUpdating
                    ? ctgs.map((prCtg) => (
                        <div
                          key={prCtg.id}
                          className="bg-primary2 py-[6px] px-4 text-brand-gray-2 rounded-full text-sm font-medium cursor-default"
                        >
                          {prCtg.name}
                        </div>
                      ))
                    : ctgs.map((prCtg) => (
                        <div
                          key={prCtg.id}
                          className="bg-primary2 py-[6px] px-3 text-brand-gray-2 rounded-full text-sm font-medium flex justify-start items-center gap-1 cursor-default"
                        >
                          <div>{prCtg.name}</div>
                          <RxCross1
                            className="size-4 cursor-pointer"
                            onClick={() => {
                              setCtgs((prev) =>
                                prev.filter((d) => d.id !== prCtg.id),
                              );
                            }}
                          />
                        </div>
                      ))}
                </div>
                {isUpdating && (
                  <div className="w-[40%]">
                    <PharmacySearcher<ThisForm>
                      withoutLabel={true}
                      endpoint="/products/categories"
                      placeholder="Searc for Product Categories"
                      formHook={{
                        errors,
                        label: 'product_categories',
                        register,
                        trigger,
                        watch,
                      }}
                      onClickAValueCallback={(id, name) => {
                        if (ctgs.length === 20) {
                          dispatch(
                            showToastAsync({
                              message: 'Can only have maximum of 20 Categories',
                              type: 'warning',
                            }),
                          );
                          return;
                        }
                        if (ctgs.some((d) => d.id === id)) return;
                        setCtgs((prev) => [...prev, { id, name }]);
                      }}
                    />
                  </div>
                )}
                {isUpdating && ctgs.length === 0 && (
                  <>
                    <div className="text-invalid-field">
                      Please enter Product Categories
                    </div>
                  </>
                )}
              </div>

              {/* MARK: PRODUCT FORM */}
              <div className={'px-12 mt-6'}>
                <div className={subTitle}>Product Form</div>
                <div className="flex">
                  {!isUpdating ? (
                    <div className="bg-blue-100 py-[6px] px-4 text-blue-600 font-semibold rounded-full text-sm cursor-default">
                      {data.data.product_form.name}
                    </div>
                  ) : (
                    productForm.name && (
                      <div className="bg-blue-100 py-[6px] px-4 text-blue-600 font-semibold rounded-full text-sm cursor-default flex justify-start items-center gap-1">
                        {productForm.name}
                        <RxCross1
                          className="size-4 cursor-pointer"
                          onClick={() => {
                            setProductForm({ id: 0, name: '' });
                          }}
                        />
                      </div>
                    )
                  )}
                </div>
                {isUpdating && (
                  <div className="w-[40%] mt-1">
                    <PharmacySearcher<ThisForm>
                      withoutLabel={true}
                      endpoint="/products/forms"
                      placeholder="Search for Product Forms"
                      formHook={{
                        errors,
                        label: 'product_form_id',
                        register,
                        trigger,
                        watch,
                      }}
                      onClickAValueCallback={(id, name) => {
                        if (manu.id === id) return;
                        setProductForm({ id, name });
                      }}
                    />
                  </div>
                )}
                {isUpdating && !productForm.id && !productForm.name && (
                  <>
                    <div className="text-invalid-field">
                      Please enter the Product Form
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* MARK: BOTTOM BUTTONS */}
          <div className="flex justify-end items-center gap-6 mt-20 w-full">
            <div className={`flex justify-end items-center gap-6 mt-20 mb-4`}>
              {role === 'admin' && (
                <>
                  <button
                    className={`cta-btn-1`}
                    onClick={handleClickUpdateOrSave}
                    disabled={loadingUpdateProduct}
                  >
                    {isUpdating
                      ? loadingUpdateProduct
                        ? 'Loading...'
                        : 'SAVE'
                      : 'UPDATE'}
                  </button>
                  {!isUpdating && (
                    <button
                      className="warning-btn-1"
                      onClick={handleCLickDelete}
                    >
                      DELETE
                    </button>
                  )}
                  <button
                    className="pessimist-btn-2"
                    onClick={handleOnClickAbort}
                  >
                    {isUpdating ? 'CANCEL' : 'BACK'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* FLOATING ADD PRODUCT TO PHARMACIST'S PHARMACY */}
        </div>
        {role === 'pharmacist' && (
          <div className="cursor-pointer fixed right-20 bottom-14 shadow-lg rounded-full overflow-clip">
            <Dialog
              onOpenChange={(isOpen) => {
                setShouldResetDialog(!isOpen);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="!bg-primary !text-white px-8 py-8 font-semibold text-xl rounded-full"
                >
                  Add to my pharmacy
                </Button>
              </DialogTrigger>
              <AddProductToPharmacy
                shouldResetDialog={shouldResetDialog}
                productId={productId ?? '0'}
              />
            </Dialog>
          </div>
        )}
      </div>
    );
  }

  return content;
};

export default ProductDetails;
