import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { RxCross1 } from 'react-icons/rx';
import StyledImageUploader from '@/components/ui/StyledImageUploader';
import { dismissUpdatePartnerModal } from '@/store/modals/modalsSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import YearDropdown from './YearDropdown';
import ActiveDayCheckbox from './ActiveDayCheckbox';
import { useForm } from 'react-hook-form';
import { activeDays, IPartners, TActiveDay } from '@/models/Partners';
import moment from 'moment';
import { TWColCenterize } from '@/utils/UI/TWStrings';
import { showToastAsync } from '@/store/toast/toastSlice';
import { useNavigate } from 'react-router-dom';
import splitActiveDays from './activeDaysSplitted';
import usePutFormPartner from './usePutFormPartner';
import { differenceSets } from '@/utils/Sets';

export interface ThisForm {
  name: string;
  logo: File | null;
  year_founded: string;
  active_days: TActiveDay[];
  timeRange: {
    startTime: string | null;
    endTime: string | null;
  };
  isActive: boolean;
}

const UpdatePartner: React.FC<{ partner: IPartners }> = ({ partner }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // error message
  const [shouldShowYearFoundedErr, setShouldShowYearFoundedErr] =
    useState(false);
  const [shouldShowActiveDaysErr, setShouldShowActiveDaysErr] = useState(false);
  const [shouldShowTimeRangeErr, setShouldShowTimeRangeErr] = useState(false);
  const [shouldShowTimeRangeInvalidErr, setShouldShowTimeRangeInvalidErr] =
    useState(false);
  const [shouldShowPNGErr, setShouldShowPNGErr] = useState(false);
  const [shouldShowValidSizeErr, setShouldShowValidSizeErr] = useState(false);

  // FORM AND FETCH DATA
  const [thisForm, setThisForm] = useState<ThisForm>({
    name: '',
    logo: null,
    year_founded: '',
    active_days: [],
    timeRange: { startTime: null, endTime: null },
    isActive: true,
  });
  const { fetchData, loading, error, data } = usePutFormPartner(
    thisForm,
    String(partner.id),
  );

  const [didSuccessUpdatePharmacist, setDidSuccessUpdatePharmacist] =
    useState(false);

  // MARK: TIME RANGE
  const [startTime, setStartTime] = useState(
    thisForm.timeRange.startTime ?? '00:00',
  );
  const [endTime, setEndTime] = useState(thisForm.timeRange.endTime ?? '00:00');

  useEffect(() => {
    const a = moment(thisForm.timeRange.startTime, 'HH:mm').format('HH:mm');
    const b = moment(thisForm.timeRange.endTime, 'HH:mm').format('HH:mm');

    setStartTime(a);
    setEndTime(b);

    setThisForm((prev) => ({
      ...prev,
      timeRange: {
        startTime: a,
        endTime: b,
      },
    }));
  }, []);

  // MARK: HANDLE TIME RANGE
  const handleStartTimeChange = (e: moment.Moment) => {
    setStartTime(e.format('HH:mm'));
  };
  const handleEndTimeChange = (e: moment.Moment) => {
    setEndTime(e.format('HH:mm'));
  };

  useEffect(() => {
    setThisForm((prev) => ({
      ...prev,
      timeRange: {
        startTime: !startTime.includes('Invalid') ? startTime : null,
        endTime: !endTime.includes('Invalid') ? endTime : null,
      },
    }));
    setShouldShowTimeRangeErr(false);

    // must >= 6 hours
    if (
      moment(endTime, 'HH:mm').diff(moment(startTime, 'HH:mm'), 'hours') < 6
    ) {
      setShouldShowTimeRangeInvalidErr(true);
    } else {
      setShouldShowTimeRangeInvalidErr(false);
    }
  }, [startTime, endTime]);

  // ON CLICK SAVE
  const handleClickSave = async () => {
    console.log(thisForm);
    if (!nameRef.current) return;
    if (!(await trigger())) return;

    if (!thisForm.year_founded) {
      setShouldShowYearFoundedErr(true);
      return;
    }
    if (thisForm.active_days.length === 0) {
      setShouldShowActiveDaysErr(true);
      return;
    }
    if (
      thisForm.timeRange.startTime === null ||
      thisForm.timeRange.endTime === null
    ) {
      setShouldShowTimeRangeErr(true);
      return;
    }
    if (shouldShowPNGErr) return;

    // >> ABORT IF VALUES DON'T CHANGE!
    thisForm.name = nameRef.current.value;
    const formActiveDays = new Set(thisForm.active_days);
    const filledActiveDays = new Set(splitActiveDays(partner.active_days));
    const partnerStartTime = moment(partner.start_operation, 'HH:mm').format(
      'HH:mm',
    );
    const partnerEndTime = moment(partner.end_operation, 'HH:mm').format(
      'HH:mm',
    );
    if (
      thisForm.name === partner.name &&
      thisForm.year_founded === partner.year_founded &&
      differenceSets(formActiveDays, filledActiveDays).size === 0 &&
      differenceSets(filledActiveDays, formActiveDays).size === 0 &&
      startTime === partnerStartTime &&
      endTime === partnerEndTime
    ) {
      if (thisForm.logo === null) {
        dispatch(
          showToastAsync({
            message: 'You are not changing anything',
            type: 'warning',
          }),
        );
        return;
      }
    }

    // PROCEED PUT FORM
    console.log(thisForm);
    fetchData();
  };

  // USEREFS & RHF
  const {
    register,
    trigger,
    formState: { errors },
    watch,
  } = useForm<ThisForm>({ mode: 'onBlur' });
  const nameRef = useRef<HTMLInputElement>(null);

  // USEEFFECTS
  useEffect(() => {
    // PREFILL
    if (!nameRef.current) return;
    nameRef.current.value = partner.name;
    thisForm.year_founded = partner.year_founded;
    thisForm.active_days = splitActiveDays(partner.active_days);
    thisForm.isActive = partner.is_active;
    thisForm.timeRange.startTime = partner.start_operation;
    thisForm.timeRange.endTime = partner.end_operation;
    setStartTime(partner.start_operation);
    setEndTime(partner.end_operation);
  }, [partner]);

  useEffect(() => {
    if (data && !error && !loading) {
      setDidSuccessUpdatePharmacist(true);
    }

    if (error) {
      dispatch(showToastAsync({ message: error, type: 'warning' }));
    }
  }, [data, error]);

  // MARK: REACTNODE
  let content: ReactNode;
  if (!didSuccessUpdatePharmacist) {
    content = (
      <div className=" rounded-lg w-full px-12 pt-8 flex flex-col justify-start items-center">
        {/* MARK: WHOLE FORM */}
        <div className="w-full">
          {/* MARK: NAME */}
          <div className="font-semibold text-slate-600">Name</div>
          <input
            {...register('name', {
              validate: () => {
                if (!nameRef.current) return false;
                if (!nameRef.current.value) return 'Name is required';
                return true;
              },
            })}
            type="text"
            className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-4 h-12  mt-1 font-normal w-full"
            placeholder="Enter partner's name"
            ref={nameRef}
          />
          {errors.name && (
            <div className="text-invalid-field">{errors.name.message}</div>
          )}

          {/* MARK: UPLOAD LOGO */}
          <div className="font-semibold text-slate-600 mt-6 mb-2">Logo</div>
          <div className="self-start w-full ">
            <StyledImageUploader<ThisForm>
              title="Partner's Logo"
              formSetter={setThisForm}
              completionHandler={(file) => {
                setThisForm((prev) => ({
                  ...prev,
                  logo: file,
                }));
              }}
              formHook={{
                errors,
                label: 'logo',
                register,
                trigger,
                watch,
              }}
              onTypeOfPng={(isPng) => {
                setShouldShowPNGErr(!isPng);
              }}
              onValidSize={(isValid) => {
                setShouldShowValidSizeErr(!isValid);
              }}
              imageUrl={partner.logo_url}
            />
          </div>
          {errors.logo && (
            <div className="text-invalid-field">Logo is required</div>
          )}
          {shouldShowPNGErr && (
            <div className="text-invalid-field">Only PNG Image is allowed</div>
          )}
          {shouldShowValidSizeErr && (
            <div className="text-invalid-field">
              Image's size must be less than 500kB
            </div>
          )}

          {/* MARK: YEAR DROPDOWN */}
          <div className="font-semibold text-slate-600 mt-6 ">Year Founded</div>
          <YearDropdown
            onClickYear={(year) => {
              setThisForm((prev) => ({
                ...prev,
                year_founded: String(year),
              }));

              setShouldShowYearFoundedErr(false);
            }}
            thisForm={thisForm}
          />
          {shouldShowYearFoundedErr && (
            <div className="text-invalid-field">Year Founded is required</div>
          )}

          {/* MARK: Active Days */}
          <div className="font-semibold text-slate-600 mt-6 mb-2">
            Active Days
          </div>
          <div className="w-full  border-slate-300 pl-[80px] rounded-3xl h-[210px] border-2 hide-scroll">
            <div className="grid grid-cols-2 gap-x-10">
              {activeDays.map((day) => (
                <ActiveDayCheckbox
                  key={day}
                  day={day}
                  onCheckDay={(day, isChecked) => {
                    if (isChecked) {
                      setThisForm((prev) => ({
                        ...prev,
                        active_days: [...prev.active_days, day],
                      }));
                      setShouldShowActiveDaysErr(false);
                    } else {
                      setThisForm((prev) => ({
                        ...prev,
                        active_days: prev.active_days.filter((d) => d !== day),
                      }));
                    }
                  }}
                  thisForm={thisForm}
                />
              ))}
            </div>
          </div>
          {shouldShowActiveDaysErr && (
            <div className="text-invalid-field">
              Please fill at least one active day
            </div>
          )}

          {/* MARK: Operational Hours */}
          <div className="font-semibold text-slate-600 mt-6 mb-2">
            Operational Hours
          </div>
          <div
            className={` border-2 border-slate-300 rounded-3xl overflow-clip ${TWColCenterize} pb-3 pt-1`}
          >
            <div className="w-[70%] flex justify-center items-start gap-4">
              <div className="flex flex-col justify-start items-start gap-1">
                <div className="font-semibold text-sm text-slate-500">
                  From:
                </div>
                <TimePicker
                  showSecond={false}
                  onChange={handleStartTimeChange}
                  defaultValue={moment(startTime, 'HH:mm')}
                />
              </div>
              <div className="flex flex-col justify-start items-start gap-1">
                <div className="font-semibold text-sm text-slate-500">To:</div>
                <TimePicker
                  showSecond={false}
                  onChange={handleEndTimeChange}
                  defaultValue={moment(endTime, 'HH:mm')}
                />
              </div>
            </div>
          </div>
          {shouldShowTimeRangeErr && (
            <div className="text-invalid-field">
              Please enter both Start Time and End Time
            </div>
          )}
          {shouldShowTimeRangeInvalidErr && (
            <div className="text-invalid-field">
              Operation Hours must be 6 hours minimum
            </div>
          )}

          {/* MARK: PARTNER STATUS */}
          <div className="font-semibold text-slate-600 mt-6 mb-2">
            Partner Status
          </div>
          <div className="mt-0">
            <label className="inline-flex items-center me-5 cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer checked:after:text-red-50"
                checked={thisForm.isActive}
                onChange={(e) =>
                  setThisForm((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-transparent outline-none dark:peer-focus:ring-teal-800 peer-checked:after:translate-x-full  rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
              <span
                className={`ms-3 text-sm font-semibold tracking-wider  dark:text-gray-300 ${
                  !thisForm.isActive ? 'text-gray-400' : 'text-gray-900'
                }`}
              >
                Activate
              </span>
            </label>
          </div>

          {/* BOTTOM BUTTONS */}
          <div className=" w-full gap-5 mt-12 mb-8">
            <div className="flex justify-end items-center gap-4 w-full">
              <button
                type="button"
                className="pessimist-btn-2 w-[30%]"
                onClick={() => dispatch(dismissUpdatePartnerModal())}
              >
                CANCEL
              </button>
              <button
                disabled={loading}
                className="cta-btn-1 w-[30%]"
                onClick={handleClickSave}
              >
                {loading ? 'Submitting' : 'SAVE'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col justify-start items-start w-full px-24 mt-8">
        <div className="text-2xl font-medium self-center">Success</div>
        <div className="text-slate-500 self-center">
          Successfully updated Partner
        </div>

        <button
          className="cta-btn-2 self-center mt-10 mb-8"
          onClick={() => {
            dispatch(dismissUpdatePartnerModal());
            navigate(0);
          }}
        >
          See Partners List
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-white  ${
        !didSuccessUpdatePharmacist ? 'w-[600px] ' : 'h-fit'
      } h-[900px] overflow-y-scroll pt-10 flex flex-col justify-start items-center rounded-xl`}
    >
      {!didSuccessUpdatePharmacist && (
        <div className="text-2xl font-semibold  self-center">
          Update Pharmacist
        </div>
      )}

      {/* CLOSE BTN */}
      <div
        className="absolute right-4 top-4 cursor-pointer"
        onClick={() => dispatch(dismissUpdatePartnerModal())}
      >
        <RxCross1 className="size-7 text-slate-500" />
      </div>

      {content}
    </div>
  );
};

export default UpdatePartner;
