import { ForwardedRef, forwardRef } from 'react';
import { TWCenterize } from '../../utils/UI/TWStrings';
import { handleKeyDownInvalidNumber } from '@/utils/HandleKeys';

const InputWithUnitStyle = forwardRef(
  (
    {
      unitPadding,
      unit,
      withStyle,
      onBlurCb,
    }: {
      unit: string;
      withStyle?: string;
      unitPadding?: string;
      onBlurCb: (d: string) => void;
    },
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <div
        className={`h-9  flex justify-start items-center w-full  ${
          withStyle ? withStyle : 'ml-2'
        }`}
      >
        <input
          type="number"
          ref={ref}
          onBlur={(e) => {
            onBlurCb(e.target.value);
          }}
          className="pl-3 h-full  w-full outline-none border-l-2  border-t-2 border-b-2 border-l-border-1 border-t-border-1 border-b-border-1 overflow-clip rounded-tl-lg rounded-bl-lg"
          onKeyDown={handleKeyDownInvalidNumber}
        />
        <div
          className={`${TWCenterize} p-1 ${
            unitPadding ? unitPadding : 'px-2'
          }  bg-primary2 text-[#bbffe3] text-sm h-full font-medium italic border-t-primary2 rounded-tr-lg rounded-br-lg hover:cursor-default`}
        >
          {unit}
        </div>
      </div>
    );
  },
);

export default InputWithUnitStyle;
