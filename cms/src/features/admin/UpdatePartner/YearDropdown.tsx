import React, { useEffect, useRef, useState } from 'react';
import { IoChevronDownOutline, IoChevronUpOutline } from 'react-icons/io5';

import { ThisForm } from './index';

const years = [...Array(125).keys()].map((x) => x + 1900).reverse();

const YearDropdown: React.FC<{
  onClickYear: (year: number) => void;
  thisForm: ThisForm;
}> = ({ onClickYear, thisForm }) => {
  const [displayText, setDisplayText] = useState('Select a year');
  const [didChoose, setDidChoose] = useState(false);
  // const [chosenYear, setChosenYear] = useState<string | null | undefined>(c);

  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const [shouldShow, setShouldShow] = useState(false);

  const handleClickAYear = (val: number) => () => {
    setShouldShow(false);
    setDidChoose(true);
    setDisplayText(String(val));

    // handler
    onClickYear(val);
  };

  useEffect(() => {
    setDisplayText(thisForm.year_founded);
  }, [thisForm]);

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

  return (
    <div className="w-full relative">
      <div
        className={`flex justify-between items-center text-slate-400 cursor-pointer border-2 border-slate-300 focus:outline-[#196157] rounded-md px-4 h-12  mt-1 font-normal w-full  ${
          didChoose && 'text-slate-500 border-slate-300'
        }`}
        ref={btnRef}
        onClick={() => setShouldShow((prev) => !prev)}
      >
        {/* {chosenYear ? String(chosenYear) : displayText} */}
        {displayText}
        {shouldShow ? (
          <IoChevronUpOutline className="size-6" />
        ) : (
          <IoChevronDownOutline className="size-6" />
        )}
      </div>

      {/* DROPDOWN */}
      <div
        className={`dropdown-partner-default partner-dropdown-shadow w-full absolute z-10 bg-white rounded-lg top-[100%]  overflow-y-scroll 
          ${shouldShow && 'dropdown-partner-active'}
          `}
        ref={ref}
      >
        {years.map((val) => {
          return (
            <div
              className="text-sm pl-4 py-2 cursor-pointer hover:bg-slate-50"
              onClick={handleClickAYear(val)}
              key={val}
            >
              {val}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YearDropdown;
