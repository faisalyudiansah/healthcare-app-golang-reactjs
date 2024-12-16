import { TActiveDay } from '@/models/Partners';
import React, { useState } from 'react';

const ActiveDayCheckbox: React.FC<{
  day: TActiveDay;
  onCheckDay: (day: TActiveDay, isChecked: boolean) => void;
}> = ({ day, onCheckDay }) => {
  const [shouldShowChk, setShouldShowChk] = useState(false);

  return (
    <label htmlFor={`day-${day}`} className="active-day-checkbox my-4">
      <input
        type="checkbox"
        name=""
        id={`day-${day}`}
        onChange={(e) => {
          setShouldShowChk(e.target.checked);
          onCheckDay(day, e.target.checked);
        }}
        checked={shouldShowChk}
      />
      <span>
        {/* <div>{shouldShowChk && <GiCheckMark />}</div> */}
        <div className={`${shouldShowChk && 'bg-primary'}`}></div>
        {day}
      </span>
    </label>
  );
};

export default ActiveDayCheckbox;
