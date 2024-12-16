import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  getFormCreateProduct,
  redoProgress,
  updateCreateProductForm,
  updateProgress,
} from '@/store/createProduct/createProductSlice';
import InputNumberWithLabel from '@/components/ui/InputNumberWithLabel';
import { GiCheckMark } from 'react-icons/gi';
import { FormFour } from '@/models/CreateProductForms';
import { useForm } from 'react-hook-form';
import StyledImageUploader from '@/components/ui/StyledImageUploader';
import { TWColCenterize } from '@/utils/UI/TWStrings';
import { useEffect, useRef, useState } from 'react';
import { FiPlus } from 'react-icons/fi';

const Step4Form = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currCreateProductForm = useSelector(getFormCreateProduct);

  const [formFour, setFormFour] = useState<FormFour>({
    thumbnailImg: null,
    firstImg: null,
    secondImg: null,
    thirdImg: null,
    height: 0,
    length: 0,
    weight: 0,
    width: 0,
    isActive: true, // TODO: default to true or false??
  });

  const {
    register,
    trigger,
    formState: { errors },
    watch,
  } = useForm<FormFour>({ mode: 'onBlur' });

  const handleBack = () => {
    dispatch(redoProgress({ step: 4, status: 'none' }));
  };
  const handleNext = async () => {
    if (!(await trigger())) return;
    if (
      shouldShowPNGThumbErr ||
      shouldShowPNG1stImgErr ||
      shouldShowPNG2ndImgErr ||
      shouldShowPNG3rdImgErr
    )
      return;
    if (
      shouldShowValidThumbErr ||
      shouldShowValid1stImgErr ||
      shouldShowValid2ndImgErr ||
      shouldShowValid3rdImgErr
    )
      return;

    dispatch((d) => {
      if (formFour.thumbnailImg) {
        d(updateCreateProductForm({ thumbnailImg: formFour.thumbnailImg }));
      }

      if (formFour.firstImg) {
        d(updateCreateProductForm({ firstImg: formFour.firstImg }));
      }

      if (formFour.secondImg) {
        d(updateCreateProductForm({ secondImg: formFour.secondImg }));
        d(updateCreateProductForm({ shouldShow2ndImg: true }));
      } else {
        d(updateCreateProductForm({ secondImg: null }));
        d(updateCreateProductForm({ shouldShow2ndImg: false }));
      }

      if (formFour.thirdImg) {
        d(updateCreateProductForm({ thirdImg: formFour.thirdImg }));
        d(updateCreateProductForm({ shouldShow3rdImg: true }));
      } else {
        d(updateCreateProductForm({ thirdImg: null }));
        d(updateCreateProductForm({ shouldShow3rdImg: false }));
      }

      if (formFour.height) {
        d(updateCreateProductForm({ height: formFour.height }));
      }
      if (formFour.weight) {
        d(updateCreateProductForm({ weight: formFour.weight }));
      }
      if (formFour.length) {
        d(updateCreateProductForm({ length: formFour.length }));
      }
      if (formFour.width) {
        d(updateCreateProductForm({ width: formFour.width }));
      }

      d(updateCreateProductForm({ isActive: formFour.isActive }));

      d(updateProgress({ step: 4, status: 'completed' }));
    });
  };

  const [shouldShowChk, setShouldShowChk] = useState(true); // TODO: default to true or false??
  useEffect(() => {
    // MARK: UPDATE IS_ACTIVE
    setFormFour((prev) => {
      return {
        ...prev,
        isActive: shouldShowChk,
      };
    });
  }, [shouldShowChk]);

  // MARK: HANDLE ADD MORE IMAGES
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

  // TEXT INPUT REFS
  const weightRef = useRef<HTMLInputElement>(null);
  const lengthRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);
  const widthRef = useRef<HTMLInputElement>(null);

  // prefill
  useEffect(() => {
    if (weightRef.current) {
      if (currCreateProductForm.weight) {
        weightRef.current.value = String(currCreateProductForm.weight);
      }
    }
    if (heightRef.current) {
      if (currCreateProductForm.height) {
        heightRef.current.value = String(currCreateProductForm.height);
      }
    }
    if (lengthRef.current) {
      if (currCreateProductForm.length) {
        lengthRef.current.value = String(currCreateProductForm.length);
      }
    }
    if (widthRef.current) {
      if (currCreateProductForm.width) {
        widthRef.current.value = String(currCreateProductForm.width);
      }
    }

    if (currCreateProductForm.isActive !== undefined) {
      setFormFour((prev) => {
        return {
          ...prev,
          isActive: currCreateProductForm.isActive!,
        };
      });
      setShouldShowChk(currCreateProductForm.isActive!);
    }

    // prefill additional images
    setShouldShow2ndImg(currCreateProductForm.shouldShow2ndImg ?? false);
    setShouldShow3rdImg(currCreateProductForm.shouldShow3rdImg ?? false);
  }, [currCreateProductForm]);

  return (
    <>
      <div className="w-full h-full min-h-[580px] pt-16 flex flex-col justify-between items-start ">
        {/* MARK: IMAGE UPLOADS */}
        <div className="flex justify-start items-start gap-8 ">
          {/* THUMBNAIL */}
          <div className={`${TWColCenterize}`}>
            <StyledImageUploader<FormFour>
              title="Upload a Thumbnail"
              forImgField="thumbnailImg"
              formSetter={setFormFour}
              formHook={{
                errors,
                label: 'thumbnailImg',
                register,
                trigger,
                watch,
              }}
              onTypeOfPng={(isPng) => {
                setShouldShowPNGThumbErr(!isPng);
              }}
              onValidSize={(isValid) => {
                console.log('>>>', isValid);
                setShouldShowValidThumbErr(!isValid);
              }}
            />
            {errors.thumbnailImg && (
              <div className="text-invalid-field">Thumbnail is required</div>
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

          {/* 1ST IMAGE */}
          <div className={`${TWColCenterize}`}>
            <StyledImageUploader<FormFour>
              title="Upload an Image"
              forImgField="firstImg"
              formSetter={setFormFour}
              formHook={{ errors, label: 'firstImg', register, trigger, watch }}
              onTypeOfPng={(isPng) => {
                setShouldShowPNG1stImgErr(!isPng);
              }}
              onValidSize={(isValid) => {
                setShouldShowValid1stImgErr(!isValid);
              }}
            />
            {errors.firstImg && (
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

          {shouldShow2ndImg && (
            <div className="flex flex-col justify-start items-center">
              <div className={`${TWColCenterize}`}>
                <StyledImageUploader<FormFour>
                  title="Upload Image"
                  additionalTitle="(Optional)"
                  forImgField="secondImg"
                  formSetter={setFormFour}
                  additionalImgHook={{
                    getter: shouldShow2ndImg,
                    setter: setShouldShow2ndImg,
                  }}
                  formHook={{
                    errors,
                    label: 'secondImg',
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
                />
              </div>
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

          {shouldShow3rdImg && (
            <div className="flex flex-col justify-start items-center">
              <div className={`${TWColCenterize}`}>
                <StyledImageUploader<FormFour>
                  title="Upload Image"
                  additionalTitle="(Optional)"
                  forImgField="thirdImg"
                  formSetter={setFormFour}
                  additionalImgHook={{
                    getter: shouldShow3rdImg,
                    setter: setShouldShow3rdImg,
                  }}
                  formHook={{
                    errors,
                    label: 'thirdImg',
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
                />
              </div>
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

          {(!shouldShow2ndImg || !shouldShow3rdImg) && (
            <div
              className="product-add-more-images"
              onClick={handleClickAddMoreImgs}
            >
              <FiPlus className="size-5" />
              <div>Add more images</div>
            </div>
          )}
        </div>

        {/* MARK: TEXT INPUTS */}
        <div className="w-full grid grid-cols-2 gap-y-6 gap-x-8 mt-8">
          <div>
            <InputNumberWithLabel
              formHook={{
                errors,
                label: 'height',
                register,
                trigger,
                watch,
              }}
              formFourCallback={setFormFour}
              forName="height"
              placeholder="Input height in what?"
              ref={heightRef}
            />
            {errors.height && (
              <div className="text-invalid-field">Height is required</div>
            )}
          </div>

          <div>
            <InputNumberWithLabel
              formHook={{
                errors,
                label: 'weight',
                register,
                trigger,
                watch,
              }}
              formFourCallback={setFormFour}
              forName="weight"
              placeholder="Input weight in what?"
              ref={weightRef}
            />
            {errors.weight && (
              <div className="text-invalid-field">Weight is required</div>
            )}
          </div>

          <div>
            <InputNumberWithLabel
              formHook={{
                errors,
                label: 'length',
                register,
                trigger,
                watch,
              }}
              formFourCallback={setFormFour}
              forName="length"
              placeholder="Input length in what?"
              ref={lengthRef}
            />
            {errors.length && (
              <div className="text-invalid-field">Length is required</div>
            )}
          </div>

          <div>
            <InputNumberWithLabel
              formHook={{
                errors,
                label: 'width',
                register,
                trigger,
                watch,
              }}
              formFourCallback={setFormFour}
              forName="width"
              placeholder="Input width in what?"
              ref={widthRef}
            />
            {errors.width && (
              <div className="text-invalid-field">Width is required</div>
            )}
          </div>
        </div>

        {/* MARK: ISACTIVE CHECKBOX BUTTON */}
        <label htmlFor="isActive" className="isactive_checkboxbtn mt-8">
          <input
            type="checkbox"
            name=""
            id="isActive"
            onChange={(e) => setShouldShowChk(e.target.checked)}
            checked={shouldShowChk}
          />
          <span>
            <div>{shouldShowChk && <GiCheckMark />}</div>
            give me words
          </span>
        </label>

        {/* BUTTONS */}
        <div className="w-full mt-16 mb-8 flex justify-end items-center gap-4">
          <button className="form-pessimist-btn" onClick={handleBack}>
            BACK
          </button>
          <button className="form-optimist-btn" onClick={handleNext}>
            NEXT
          </button>
        </div>
      </div>
    </>
  );
};

export default Step4Form;
