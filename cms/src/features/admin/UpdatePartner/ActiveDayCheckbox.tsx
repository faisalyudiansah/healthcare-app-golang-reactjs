import { TActiveDay } from '@/models/Partners';
import React, { useEffect, useState } from 'react';
import { ThisForm } from '.';
import splitActiveDays from './activeDaysSplitted';

const ActiveDayCheckbox: React.FC<{
  day: TActiveDay;
  thisForm: ThisForm;
  onCheckDay: (day: TActiveDay, isChecked: boolean) => void;
}> = ({ day, onCheckDay, thisForm }) => {
  const [shouldShowChk, setShouldShowChk] = useState(false);

  useEffect(() => {
    for (const d of thisForm.active_days) {
      if (d === day) {
        setShouldShowChk(true);
        return;
      }
    }
  }, [thisForm]);

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
        <div className={`${shouldShowChk && 'bg-primary'}`}></div>
        {day}
      </span>
    </label>
  );
};

export default ActiveDayCheckbox;
