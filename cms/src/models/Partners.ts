export interface IPartners {
  id: number;
  name: string;
  logo_url: string;
  year_founded: string;
  active_days: string;
  start_operation: string;
  end_operation: string;
  is_active: boolean;
  // created_at: '2024-09-04T10:58:06.27414Z';
  // updated_at: '2024-09-04T10:58:06.27414Z';
}

export type TActiveDay =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export const activeDays: TActiveDay[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
