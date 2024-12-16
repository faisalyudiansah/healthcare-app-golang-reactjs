import { RxCross1 } from 'react-icons/rx';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { setShowCreatePharmacistModal } from '@/store/modals/modalsSlice';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  validateEmail,
  validatePassword,
  validateSIPANumber,
} from '@/utils/FormValidator';
import { handleKeyDownInvalidNumber } from '@/utils/HandleKeys';
import { ReactNode, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { showToastAsync } from '@/store/toast/toastSlice';
import { useNavigate } from 'react-router-dom';

interface ICreatePharmacist {
  email: string;
  password: string;
  passwordRepeat: string;
  full_name: string;
  sipa_number: string;
  whatsapp_number: string;
  years_of_experience: number;
}

const AddPharmacist = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [_, setThisState] = useState<{
    loading: boolean;
    data: string;
    error: string;
  }>({
    loading: false,
    data: '',
    error: '',
  });
  const [didSuccessCreatePharmacist, setDidSuccessCreatePharmacist] =
    useState(false);

  const {
    register,
    formState: { errors, isSubmitting },
    watch,
    handleSubmit,
    getValues,
  } = useForm<ICreatePharmacist>({ mode: 'onBlur' });

  const onSubmit: SubmitHandler<ICreatePharmacist> = async (d) => {
    setThisState((prev) => ({ ...prev, loading: true }));
    await axios
      .post('/admin/pharmacists', {
        email: d.email,
        password: d.password,
        full_name: d.full_name,
        sipa_number: d.sipa_number,
        whatsapp_number: d.whatsapp_number,
        years_of_experience: Number(d.years_of_experience),
      })
      .then(() => setDidSuccessCreatePharmacist(true))
      .catch((e: AxiosError<{ message: string }>) => {
        const message = e.response?.data.message ?? 'Failed to get message';
        dispatch(showToastAsync({ message, type: 'warning' }));
      })
      .finally(() => {
        setThisState((prev) => ({ ...prev, loading: false }));
      });
  };

  let content: ReactNode;
  if (!didSuccessCreatePharmacist) {
    content = (
      <div className=" rounded-lg w-full px-10 pt-8">
        {/* MARK: WHOLE FORM */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* MARK: EMAIL */}
          <label
            htmlFor="pharmacist-id"
            className="flex flex-col justify-start items-start font-medium text-slate-600"
          >
            <div>
              E-Mail <span className="text-red-600">*</span>
            </div>

            <input
              {...register('email', { validate: validateEmail })}
              type="text"
              id="pharmacist-id"
              placeholder="Enter email"
              className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[60%] mt-1 font-normal"
            />
          </label>
          {errors.email && (
            <div className="text-invalid-field">{errors.email.message}</div>
          )}

          {/* MARK: PASSWORD */}
          <label
            htmlFor="pharmacist-pwd"
            className="flex flex-col justify-start items-start font-medium text-slate-600 mt-6"
          >
            <div>
              Password <span className="text-red-600">*</span>
            </div>

            <input
              {...register('password', { validate: validatePassword })}
              type="password"
              id="pharmacist-pwd"
              placeholder="Enter password"
              className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[60%] mt-1 font-normal"
            />
          </label>
          {errors.password && (
            <div className="text-invalid-field">{errors.password.message}</div>
          )}

          <label
            htmlFor="pharmacist-pwdrpt"
            className="flex flex-col justify-start items-start font-medium text-slate-600 mt-6"
          >
            <div>
              Repeat Password <span className="text-red-600">*</span>
            </div>

            <input
              {...register('passwordRepeat', {
                validate: (val) => {
                  if (!val) {
                    return 'Password confirmation is required';
                  }

                  if (watch('password') !== val) {
                    return 'Password confirmation must be the same';
                  }
                  return true;
                },
              })}
              type="password"
              id="pharmacist-pwdrpt"
              placeholder="Enter password"
              className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[60%] mt-1 font-normal"
            />
          </label>
          {errors.passwordRepeat && (
            <div className="text-invalid-field">
              {errors.passwordRepeat.message}
            </div>
          )}

          {/* BREAK LINE */}
          <div className="text-lg font mt-10">Pharmacist Details</div>
          <div className="border-[1px] border-slate-200 w-full mt-1 mb-4"></div>

          {/* MARK: FULLNAME */}
          <label
            htmlFor="pharmacist-name"
            className="flex flex-col justify-start items-start font-medium text-slate-600"
          >
            <div>
              Full Name <span className="text-red-600">*</span>
            </div>
            <input
              {...register('full_name', {
                required: true,
              })}
              type="text"
              id="pharmacist-name"
              placeholder="Enter full name"
              className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[60%] mt-1 font-normal"
            />
          </label>
          {errors.full_name && (
            <div className="text-invalid-field">Full name is required</div>
          )}

          {/* MARK: SIPA NUMBER */}
          <label
            htmlFor="pharmacist-sipa"
            className="flex flex-col justify-start items-start font-medium text-slate-600 mt-6"
          >
            <div>
              SIPA Number <span className="text-red-600">*</span>
            </div>
            <input
              {...register('sipa_number', {
                validate: validateSIPANumber,
              })}
              type="text"
              id="pharmacist-sipa"
              placeholder="Enter SIPA Number"
              className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[60%] mt-1 font-normal"
            />
          </label>
          {errors.sipa_number && (
            <div className="text-invalid-field">
              {errors.sipa_number.message}
            </div>
          )}

          {/* MARK: WHATSAPP NUMBER */}
          <label
            htmlFor="pharmacist-wanumber"
            className="flex flex-col justify-start items-start font-medium text-slate-600 mt-6"
          >
            <div>
              WhatsApp Number <span className="text-red-600">*</span>
            </div>
            <input
              {...register('whatsapp_number', {
                validate: (val) => {
                  if (!val) {
                    return 'WhatsApp Number is required';
                  }

                  if (!/^(\+62|62|08)[0-9]{8,12}$/.test(val)) {
                    return 'Please input a valid phone number';
                  }

                  return true;
                },
              })}
              type="number"
              id="pharmacist-wanumber"
              placeholder="Enter WhatsApp Number"
              className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[60%] mt-1 font-normal"
              onKeyDown={handleKeyDownInvalidNumber}
            />
          </label>
          {errors.whatsapp_number && (
            <div className="text-invalid-field">
              {errors.whatsapp_number.message}
            </div>
          )}

          {/* MARK: YOE */}
          <label
            htmlFor="pharmacist-yoe"
            className="flex flex-col justify-start items-start font-medium text-slate-600 mt-6"
          >
            <div>
              Years of Experience <span className="text-red-600">*</span>
            </div>
            <input
              {...register('years_of_experience', {
                validate: (val) => {
                  if (!val) {
                    return 'Years of Experience is required';
                  }

                  if (val < 0) {
                    return 'Please enter number larger than 0';
                  }

                  if (val > 70) {
                    return 'Please enter number no larger than 70';
                  }

                  return true;
                },
              })}
              type="number"
              id="pharmacist-yoe"
              placeholder="Enter number of years"
              className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[32%] mt-1 font-normal"
              onKeyDown={handleKeyDownInvalidNumber}
            />
          </label>
          {errors.years_of_experience && (
            <div className="text-invalid-field">
              {errors.years_of_experience.message}
            </div>
          )}

          {/* BOTTOM BUTTONS */}
          <div className="w-full flex justify-between gap-5 mt-12 mb-8">
            <button
              type="button"
              className="pessimist-btn-2 w-[50%]"
              onClick={() => dispatch(setShowCreatePharmacistModal(false))}
            >
              CANCEL
            </button>
            <button
              // disabled={thisState.loading}
              disabled={isSubmitting}
              className="cta-btn-1 w-[50%]"
            >
              SAVE
            </button>
          </div>
        </form>
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col justify-start items-start w-full px-24 mt-8">
        <div className="text-2xl font-medium self-center">Success</div>
        <div className="text-slate-500 self-center">
          Successfully registered a new Pharmacist
        </div>

        <div className="flex flex-col justify-start items-start mt-8 ">
          <div className="text-slate-700 font-semibold">E-Mail</div>
          <div>{getValues('email')}</div>

          <div className="text-slate-700 font-semibold mt-6">Full Name</div>
          <div>{getValues('full_name')}</div>

          <div className="text-slate-700 font-semibold mt-6">SIPA Number</div>
          <div>{getValues('sipa_number')}</div>

          <div className="text-slate-700 font-semibold mt-6">
            WhatsApp Number
          </div>
          <div>{getValues('whatsapp_number')}</div>

          <div className="text-slate-700 font-semibold mt-6">
            Years of Experience
          </div>
          <div>{getValues('years_of_experience')}</div>
        </div>

        <button
          className="cta-btn-2 self-center mt-10 mb-8"
          onClick={() => {
            dispatch(setShowCreatePharmacistModal(false));
            navigate(0);
          }}
        >
          See Pharmacists List
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-white  ${
        !didSuccessCreatePharmacist ? 'w-[750px] h-[90%]' : 'h-fit'
      } max-h-[840px] overflow-y-scroll pt-10 flex flex-col justify-start items-center rounded-xl`}
    >
      {!didSuccessCreatePharmacist && (
        <div className="text-2xl font-medium  self-center">
          Create Pharmacist
        </div>
      )}

      {/* CLOSE BTN */}
      <div
        className="absolute right-4 top-4 cursor-pointer"
        onClick={() => dispatch(setShowCreatePharmacistModal(false))}
      >
        <RxCross1 className="size-7 text-slate-500" />
      </div>

      {content}
    </div>
  );
};

export default AddPharmacist;
