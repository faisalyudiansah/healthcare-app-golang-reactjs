import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { useEffect, useRef, useState } from 'react';
import { TbAbc } from 'react-icons/tb';

import { TWColCenterize } from '@/utils/UI/TWStrings';
import { FaFilter } from 'react-icons/fa6';
import { INameAndId } from '@/models/Products';
import InputBoxSearch from '@/components/ui/InputBoxSearch';
import {
  setPharmaciesFilterName,
  setPharmaciesFilterPartner,
  setPharmaciesFilterPhramacist,
} from '@/store/pharmacies/pharmaciesSlice';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { IUser } from '@/models/Users';

const PharmaciesFilter = () => {
  const dispatch = useDispatch<AppDispatch>();

  const user = useAuthUser<IUser>();
  const role = user?.role === 'admin' ? 'admin' : 'pharmacists';

  const [shouldShow, setShouldShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const [partnerRef, setPartnerRef] = useState<INameAndId>();
  const [pharmacistRef, setPharmacistRef] = useState<INameAndId>();

  const handleClickOutside = (event: MouseEvent) => {
    if (!ref.current) return;
    if (!btnRef.current) return;

    if (
      !ref.current.contains(event.target as Node) &&
      !btnRef.current.contains(event.target as Node)
    ) {
      setShouldShow(false);
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

  const handleClickApply = () => {
    if (nameRef.current) {
      dispatch(setPharmaciesFilterName(nameRef.current.value));
    }
    if (partnerRef) {
      dispatch(setPharmaciesFilterPartner(partnerRef));
    }
    if (pharmacistRef) {
      dispatch(setPharmaciesFilterPhramacist(pharmacistRef));
    }

    setShouldShow(false);
  };

  const handleSelect = (field: string, option: INameAndId) => {
    console.log('field', field, 'Selected option:', option);
    if (field === 'Partner') {
      setPartnerRef(option);
    } else {
      setPharmacistRef(option);
    }
  };

  return (
    <div className="w-fit relative">
      <div
        ref={btnRef}
        className="flex justify-start items-center gap-2 bg-brand-gray-2 text-primary font-semibold rounded-lg px-5 py-3 cursor-pointer select-none shadow-md"
        onClick={() => {
          setShouldShow((prev) => !prev);
        }}
      >
        <FaFilter />
        Add Filters
      </div>

      {/* MARK: DROPDOWN */}
      <div
        className={`pharmacist-filter-dropdown-shadow absolute rounded-lg !h-[400px]  z-10 overflow-visible !w-[280%] bg-white top-[100%] dropdown-pharmacists-default select-none border-[1px] border-brand-gray-2  ${
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
            <label className="pharmacist">Pharmacy Name</label>
          </div>
          <div className={`absolute top-[23px] right-[26px] ${TWColCenterize}`}>
            <TbAbc className="text-slate-400 size-6" />
          </div>
        </div>

        {/* Partner */}
        <div className="px-5 py-2">
          <InputBoxSearch
            placeholder={'Enter Partner'}
            apiEndpoint={`/admin/partners`}
            displayField="name"
            valueField="id"
            label="Partner"
            onSelect={(item) => {
              handleSelect('Partner', item);
            }}
          />
        </div>

        {role === 'admin' && (
          <div className="px-5 py-2">
            <InputBoxSearch
              placeholder={'Enter Pharmacist'}
              apiEndpoint={`/admin/pharmacists`}
              displayField="name"
              valueField="id"
              label="Pharmacist"
              onSelect={(item) => {
                handleSelect('Pharmacist', item);
              }}
            />
          </div>
        )}

        {/* APPLY */}
        <div className="w-full flex justify-end items-center  pr-5 pb-3">
          <button className="cta-btn-3" onClick={handleClickApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default PharmaciesFilter;
