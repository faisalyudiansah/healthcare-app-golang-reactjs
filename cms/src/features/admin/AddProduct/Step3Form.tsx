import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  getFormCreateProduct,
  redoProgress,
  updateCreateProductForm,
  updateProgress,
} from '@/store/createProduct/createProductSlice';
import { FormThree } from '@/models/CreateProductForms';
import { useForm } from 'react-hook-form';
import FVPSearcher from '@/components/ui/FVPSearcher';

const Step3Form = () => {
  const dispatch = useDispatch<AppDispatch>();

  const currCreateProductForm = useSelector(getFormCreateProduct);
  const currForm = useSelector(getFormCreateProduct);

  const sellingUnitRef = useRef<HTMLInputElement>(null);
  const unitInPackRef = useRef<HTMLInputElement>(null);
  const [formThree, setFormThree] = useState<FormThree>({
    sellingUnit: '',
    unitInPack: '',
  });
  useEffect(() => {
    // prefill

    if (sellingUnitRef.current) {
      if (currCreateProductForm.sellingUnit) {
        sellingUnitRef.current.value = currCreateProductForm.sellingUnit;
      }
    }

    if (unitInPackRef.current) {
      if (currCreateProductForm.unitInPack) {
        unitInPackRef.current.value = currCreateProductForm.unitInPack;
      }
    }
  }, [currCreateProductForm]);

  const [showProductFormErr, setShowProductFormErr] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormThree((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  // BOTTOM BTNS
  const handleBack = () => {
    dispatch(redoProgress({ step: 3, status: 'none' }));
  };
  const handleNext = async () => {
    if (!(await trigger())) return;
    if (!currForm.productForm) {
      setShowProductFormErr(true);
      return;
    }

    dispatch((d) => {
      if (formThree.sellingUnit) {
        d(updateCreateProductForm({ sellingUnit: formThree.sellingUnit }));
      }

      if (formThree.unitInPack) {
        d(updateCreateProductForm({ unitInPack: formThree.unitInPack }));
      }

      d(dispatch(updateProgress({ step: 3, status: 'completed' })));
    });
  };

  const {
    register,
    trigger,
    formState: { errors },
    watch,
  } = useForm<FormThree>({ mode: 'onBlur' });

  return (
    <>
      {/* MARK: ProductForm DROPDOWN */}
      <div className="sub-form-heading mt-6 mb-1">Product Form</div>
      <div className="w-[50%]">
        <FVPSearcher<FormThree>
          placeholder="Insert a product form"
          endpoint="/products/forms"
          formHook={{ label: 'productForm', register, trigger, errors, watch }}
          forReduxKeyName="productForm"
          showErrorCallback={setShowProductFormErr}
          withErrorStyle={showProductFormErr}
        />
      </div>
      {errors.productForm ? (
        <div className="text-invalid-field">Insert the product form</div>
      ) : (
        showProductFormErr && (
          <div className="text-invalid-field">
            Please insert a valid Product Form from your searched results
          </div>
        )
      )}

      {/* MARK: SELLING UNIT */}
      <div className="sub-form-heading mt-6 mb-1">Selling Unit</div>
      <input
        {...register('sellingUnit', {
          validate: () => {
            if (sellingUnitRef.current) {
              if (!sellingUnitRef.current.value) {
                return false;
              }
            }
            return true;
          },
        })}
        type="text"
        className={`form-input-text ${
          errors.sellingUnit && 'form-input-text-invalid'
        }`}
        placeholder="Enter selling unit"
        name="sellingUnit"
        onChange={handleInputChange}
        ref={sellingUnitRef}
      />
      {errors.sellingUnit && (
        <div className="text-invalid-field">Selling unit is required</div>
      )}

      {/* MARK: UNIT IN PACK*/}
      <div className="sub-form-heading mt-6 mb-1">Unit In Pack</div>
      <input
        {...register('unitInPack', {
          validate: () => {
            if (unitInPackRef.current) {
              if (!unitInPackRef.current.value) {
                return false;
              }
            }
            return true;
          },
        })}
        type="text"
        className={`form-input-text ${
          errors.unitInPack && 'form-input-text-invalid'
        }`}
        placeholder="Enter unit in pack"
        name="unitInPack"
        onChange={handleInputChange}
        ref={unitInPackRef}
      />
      {errors.unitInPack && (
        <div className="text-invalid-field">Unit in pack is required</div>
      )}

      {/* BUTTONS */}
      <div className="self-end mt-16 flex justify-between items-center gap-4">
        <button className="form-pessimist-btn" onClick={handleBack}>
          BACK
        </button>
        <button className="form-optimist-btn" onClick={handleNext}>
          NEXT
        </button>
      </div>
    </>
  );
};

export default Step3Form;
