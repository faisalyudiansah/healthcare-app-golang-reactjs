import { TActiveDay } from '@/models/Partners';

const splitActiveDays = (daysString: string): TActiveDay[] => {
  return daysString.split(',') as TActiveDay[];
};

export default splitActiveDays;
