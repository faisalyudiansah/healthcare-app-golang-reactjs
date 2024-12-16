import React, { useEffect, useRef } from 'react';
import { IoChevronForwardOutline } from 'react-icons/io5';
import { IFilterPharmacistsYOERange } from '@/store/filterPharmacists/filterPharmacistsType';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { getFilterPharmacists } from '@/store/filterPharmacists/filterPharmacistsSlice';

interface YOERange {
  minYoe: number;
  maxYoe: number;
}

const YOEToolbarButton: React.FC<{
  toolbarHook: {
    state: boolean;
    setState: React.Dispatch<React.SetStateAction<boolean>>;
  };
  currentYoeHook: {
    state: IFilterPharmacistsYOERange | null;
    setState: React.Dispatch<
      React.SetStateAction<IFilterPharmacistsYOERange | null>
    >;
  };
}> = ({ toolbarHook, currentYoeHook }) => {
  const { state: shouldShow, setState: setShouldShow } = toolbarHook;
  const { state: currentYOE, setState: setCurrentYOE } = currentYoeHook;

  const yoeRanges: YOERange[] = [
    { minYoe: 0, maxYoe: 5 },
    { minYoe: 6, maxYoe: 10 },
    { minYoe: 11, maxYoe: 15 },
    { minYoe: 16, maxYoe: 20 },
    { minYoe: 21, maxYoe: 25 },
    { minYoe: 26, maxYoe: 30 },
    { minYoe: 31, maxYoe: 70 },
  ];

  const handleClickYOE = (minYoe: number, maxYoe: number) => () => {
    setCurrentYOE({ minYoe, maxYoe });
  };

  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
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

  const dispatch = useDispatch<AppDispatch>();
  const currFilter = useSelector(getFilterPharmacists);

  useEffect(() => {
    const yoeExists = currFilter.some((d) => d.type === 'yoe');
    if (!yoeExists) {
      setCurrentYOE(null);
    }
  }, [currFilter]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      className="px-5 py-2 relative"
      onClick={() => setShouldShow((prev) => !prev)}
    >
      {/* BUTTON */}
      <div
        className={`bg-transparent shadow-sm border-2 h-11 border-slate-500  pl-4 pr-1 rounded-lg flex justify-between items-center  cursor-pointer hover:border-transparent hover:bg-primary2 text-primary hover:text-brand-lightgreen  transition-all ${
          (shouldShow || currentYOE) &&
          '!bg-primary2 !text-brand-lightgreen !border-transparent'
        }`}
        ref={btnRef}
      >
        {/* MARK: DISPLAY */}
        {!currentYOE ? (
          <div className="text-sm font-medium">Years of Experience</div>
        ) : (
          <div className="text-sm font-medium">{`Years of Experience: ${
            currentYOE.minYoe <= 0
              ? '< 5'
              : currentYOE.minYoe > 30
              ? '> 30'
              : `${currentYOE.minYoe} - ${currentYOE.maxYoe}`
          }`}</div>
        )}
        {!shouldShow && <IoChevronForwardOutline className="size-6" />}
      </div>

      {/* DROPDOWN */}
      <div
        className={`yoe-toolbar-default cursor-pointer absolute right-[-34%] top-1 bg-white shadow-md border-[2px] border-brand-gray-2 rounded-lg  w-40 ${
          shouldShow && ' yoe-toolbar-active'
        }`}
        ref={ref}
      >
        {yoeRanges.map((d) => {
          if (d.minYoe > 30) {
            return (
              <div
                key={String(d.minYoe) + String(d.maxYoe)}
                className=" py-2 hover:bg-slate-100 px-2 text-center tracking-widest"
                onClick={handleClickYOE(d.minYoe, d.maxYoe)}
              >{`> 30`}</div>
            );
          }
          if (d.minYoe <= 0) {
            return (
              <div
                key={String(d.minYoe) + String(d.maxYoe)}
                className=" py-2 hover:bg-slate-100 px-2 text-center tracking-widest"
                onClick={handleClickYOE(d.minYoe, d.maxYoe)}
              >{`< 5`}</div>
            );
          }
          return (
            <div
              key={String(d.minYoe) + String(d.maxYoe)}
              className=" py-2 hover:bg-slate-100 px-2 text-center tracking-widest"
              onClick={handleClickYOE(d.minYoe, d.maxYoe)}
            >{`${d.minYoe} - ${d.maxYoe}`}</div>
          );
        })}
      </div>
    </div>
  );
};

export default YOEToolbarButton;
