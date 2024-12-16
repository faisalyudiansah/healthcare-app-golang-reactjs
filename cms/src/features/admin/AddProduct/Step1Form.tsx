import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { useNavigate } from 'react-router-dom';
import {
  getFormCreateProduct,
  updateCreateProductForm,
  updateProgress,
} from '@/store/createProduct/createProductSlice';
import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { FormOne } from '@/models/CreateProductForms';
import { useForm } from 'react-hook-form';
import FVPSearcher from '@/components/ui/FVPSearcher';

const Step1Form = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currCreateProductForm = useSelector(getFormCreateProduct);

  // MARK: this step refs
  const nameRef = useRef<HTMLInputElement>(null);
  const genericNameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // prefill

    if (nameRef.current) {
      if (currCreateProductForm.productName) {
        nameRef.current.value = currCreateProductForm.productName;
      }
    }
    if (genericNameRef.current) {
      if (currCreateProductForm.genericName) {
        genericNameRef.current.value = currCreateProductForm.genericName;
      }
    }
    if (descriptionRef.current) {
      if (currCreateProductForm.description) {
        descriptionRef.current.value = currCreateProductForm.description;
      }
    }
  }, [currCreateProductForm]);

  const navigate = useNavigate();

  const [formOne, setFormOne] = useState<FormOne>({
    productName: '',
    genericName: '',
    description: '',
    manufacturer: '',
  });
  const [showManuErr, setShowManuErr] = useState(false);
  const currForm = useSelector(getFormCreateProduct);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormOne((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleCancel = () => {
    navigate('/products');
  };

  const handleNext = async () => {
    if (!(await trigger())) return;
    if (!currForm.manufacturer) {
      setShowManuErr(true);
      return;
    }

    dispatch((d) => {
      if (formOne.productName) {
        d(
          updateCreateProductForm({
            productName: formOne.productName,
          }),
        );
      }

      if (formOne.genericName) {
        d(
          updateCreateProductForm({
            genericName: formOne.genericName,
          }),
        );
      }

      if (formOne.description) {
        d(
          updateCreateProductForm({
            description: formOne.description,
          }),
        );
      }

      d(dispatch(updateProgress({ step: 1, status: 'completed' })));
    });
  };

  const {
    register,
    trigger,
    formState: { errors },
    watch,
  } = useForm<FormOne>({ mode: 'onBlur' });

  return (
    <>
      {/* MARK: NAME */}
      <div className="sub-form-heading mt-6 mb-1">Name</div>
      <input
        {...register('productName', {
          validate: () => {
            if (nameRef.current) {
              if (!nameRef.current.value) {
                return false;
              }
            }
            return true;
          },
        })}
        type="text"
        className={`form-input-text ${
          errors.productName && 'form-input-text-invalid'
        }`}
        placeholder="Enter product name"
        name="productName"
        onChange={handleInputChange}
        ref={nameRef}
      />
      {errors.productName && (
        <div className="text-invalid-field">Name is required</div>
      )}

      {/* MARK: GENERIC NAME */}
      <div className="sub-form-heading mt-6 mb-1">Generic Name</div>
      <input
        {...register('genericName', {
          validate: () => {
            if (genericNameRef.current) {
              if (!genericNameRef.current.value) {
                return false;
              }
            }
            return true;
          },
        })}
        ref={genericNameRef}
        type="text"
        className={`form-input-text ${
          errors.genericName && 'form-input-text-invalid'
        }`}
        placeholder="Enter generic name"
        name="genericName"
        onChange={handleInputChange}
      />
      {errors.genericName && (
        <div className="text-invalid-field">Generic Name is required</div>
      )}

      {/* MARK: DESCRIPTION */}
      <div className="sub-form-heading mt-6 mb-1">Description</div>
      <TextareaAutosize
        {...register('description', {
          validate: () => {
            if (descriptionRef.current) {
              if (!descriptionRef.current.value) {
                return false;
              }
            }
            return true;
          },
        })}
        ref={descriptionRef}
        className={`form-input-textarea ${
          errors.description && 'form-input-textarea-invalid'
        } resize-none`}
        minRows={3}
        maxRows={5}
        name="description"
        onChange={handleInputChange}
        placeholder="Enter product description"
      />
      {errors.description && (
        <div className="text-invalid-field">Description is required</div>
      )}

      {/* MARK: SEARCHER  */}
      <div className="sub-form-heading mt-6 mb-1">Manufacturer</div>
      <div className="w-[50%]">
        <FVPSearcher<FormOne>
          placeholder="Insert a manufaturer"
          endpoint="/products/manufactures"
          formHook={{ label: 'manufacturer', register, trigger, errors, watch }}
          forReduxKeyName="manufacturer"
          showErrorCallback={setShowManuErr}
          withErrorStyle={showManuErr}
        />
      </div>

      {errors.manufacturer ? (
        <div className="text-invalid-field">Manufacturer is required</div>
      ) : (
        showManuErr && (
          <div className="text-invalid-field">
            Please insert a valid Manufacturer from your searched results
          </div>
        )
      )}
      {/* {errors.manufacturer && (
        <div className="text-invalid-field">Manufacturer is required</div>
      )} */}
      {/* {currForm.manufacturer} */}

      {/* BOTTOM BUTTONS */}
      <div className="self-end mt-16 flex justify-between items-center gap-4 mb-8">
        <button className="form-pessimist-btn" onClick={handleCancel}>
          CANCEL
        </button>
        <button className="form-optimist-btn" onClick={handleNext}>
          NEXT
        </button>
      </div>
    </>
  );
};

export default Step1Form;
