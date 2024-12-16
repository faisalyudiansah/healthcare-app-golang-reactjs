export interface IFilterPharmacistsText {
  name: "email" | "name" | "sipa" | "whatsapp";
  value: string;
}

export interface IFilterPharmacistsDate {
  fromDate: string;
  untilDate: string;
}

export interface IFilterPharmacistsYOERange {
  minYoe: number;
  maxYoe: number;
}

export type TFilterPharmacistsType =
  | IFilterPharmacistsText
  | IFilterPharmacistsDate
  | IFilterPharmacistsYOERange;

export interface IFilterPharmacistsObject {
  type: "textfield" | "yoe";
  value: TFilterPharmacistsType;
}

// INITIAL STATE
export interface IFilterPharmacists {
  filters: IFilterPharmacistsObject[];
}
