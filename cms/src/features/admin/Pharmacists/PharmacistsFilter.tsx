import { FaFilter } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { useEffect, useRef, useState } from 'react';
import {
  appendTextFieldFilterPharmacists,
  appendYOERangeFilterPharmacist,
} from '@/store/filterPharmacists/filterPharmacistsSlice';
import { TbAbc } from 'react-icons/tb';
import { TbNumber123 } from 'react-icons/tb';

import { TWColCenterize } from '@/utils/UI/TWStrings';
import YOEToolbarButton from './YOEToolbarButton';
import { IFilterPharmacistsYOERange } from '@/store/filterPharmacists/filterPharmacistsType';
import { handleKeyDownInvalidNumber } from '@/utils/HandleKeys';

const PharmacistsFilter = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [shouldShow, setShouldShow] = useState(false);
  const [shouldShowYOE, setShouldShowYOE] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const [chosenYOE, setChosenYOE] = useState<IFilterPharmacistsYOERange | null>(
    null,
  );

  const handleClickOutside = (event: MouseEvent) => {
    if (!ref.current) return;
    if (!btnRef.current) return;

    if (
      !ref.current.contains(event.target as Node) &&
      !btnRef.current.contains(event.target as Node)
    ) {
      setShouldShow(false);
      setShouldShowYOE(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // MAR: TEXTFIELDS REF
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const sipaRef = useRef<HTMLInputElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);

  const handleClickApply = () => {
    if (
      !nameRef.current ||
      !emailRef.current ||
      !sipaRef.current ||
      !whatsappRef.current
    )
      return;

    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const sipa = sipaRef.current.value;
    const whatsApp = whatsappRef.current.value;

    if (name) {
      dispatch(
        appendTextFieldFilterPharmacists({
          name: 'name',
          value: name,
        }),
      );
      nameRef.current.value = '';
    }

    if (email) {
      dispatch(
        appendTextFieldFilterPharmacists({
          name: 'email',
          value: email,
        }),
      );
      emailRef.current.value = '';
    }

    if (sipa) {
      dispatch(
        appendTextFieldFilterPharmacists({
          name: 'sipa',
          value: sipa,
        }),
      );
      sipaRef.current.value = '';
    }

    if (whatsApp) {
      dispatch(
        appendTextFieldFilterPharmacists({
          name: 'whatsapp',
          value: whatsApp,
        }),
      );
      whatsappRef.current.value = '';
    }

    if (chosenYOE) {
      dispatch(
        appendYOERangeFilterPharmacist({
          minYoe: chosenYOE.minYoe,
          maxYoe: chosenYOE.maxYoe,
        }),
      );
    }

    setShouldShow(false);
  };

  return (
    <div className="w-fit relative">
      <div
        ref={btnRef}
        className="flex justify-start items-center gap-2 bg-brand-gray-2  text-primary font-semibold rounded-lg px-5 py-3 cursor-pointer select-none shadow-md"
        onClick={() => {
          setShouldShow((prev) => !prev);
          setShouldShowYOE(false);
        }}
      >
        <FaFilter />
        Add Filters
      </div>

      {/* MARK: DROPDOWN */}
      <div
        className={`pharmacist-filter-dropdown-shadow absolute rounded-lg !overflow-visible  z-10 !w-[280%] bg-white top-[100%] dropdown-pharmacists-default select-none border-[1px] border-brand-gray-2  ${
          shouldShow && 'dropdown-pharmacists-active'
        }`}
        ref={ref}
        onKeyDown={(e) => {
          if (e.code === 'Enter') {
            handleClickApply();
          }
        }}
      >
        {/* NAME */}
        <div className="px-5 py-3 pt-4 relative">
          <div className="interactive-input-2">
            <input
              type="text"
              className="w-full subinput"
              placeholder=" "
              ref={nameRef}
            />
            <label className="pharmacist">Name</label>
          </div>
          <div className={`absolute top-[23px] right-[26px] ${TWColCenterize}`}>
            <TbAbc className="text-slate-400 size-6" />
          </div>
        </div>

        {/* EMAIL */}
        <div className="px-5 py-3 relative">
          <div className="interactive-input-2">
            <input
              type="text"
              className="w-full subinput"
              placeholder=" "
              ref={emailRef}
            />
            <label className="pharmacist">E-Mail</label>
          </div>

          <div className={`absolute top-[19px] right-[26px] ${TWColCenterize}`}>
            <TbAbc className="text-slate-400 size-6" />
          </div>
        </div>

        {/* SIPA NUMBER */}
        <div className="px-5 py-3 relative">
          <div className="interactive-input-2">
            <input
              type="number"
              className="w-full subinput"
              placeholder=" "
              ref={sipaRef}
              onKeyDown={handleKeyDownInvalidNumber}
            />
            <label className="pharmacist">SIPA Number</label>
          </div>

          <div className={`absolute top-[19px] right-[28px] ${TWColCenterize}`}>
            <TbNumber123 className="text-slate-400 size-6" />
          </div>
        </div>

        {/* WA */}
        <div className="px-5 py-3 relative">
          <div className="interactive-input-2">
            <input
              type="number"
              className="w-full subinput"
              placeholder=" "
              ref={whatsappRef}
              onKeyDown={handleKeyDownInvalidNumber}
            />
            <label className="pharmacist">WhatsApp</label>
          </div>

          <div className={`absolute top-[19px] right-[28px] ${TWColCenterize}`}>
            <TbNumber123 className="text-slate-400 size-6" />
          </div>
        </div>

        {/* YEARS OF EXPERIENCE */}
        <YOEToolbarButton
          toolbarHook={{ state: shouldShowYOE, setState: setShouldShowYOE }}
          currentYoeHook={{ state: chosenYOE, setState: setChosenYOE }}
        />

        {/* APPLY */}
        <div className="w-full flex justify-end items-center mt-4 pr-5 pb-3">
          <button className="cta-btn-3" onClick={handleClickApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default PharmacistsFilter;
