import { INameAndId } from "../../models/Products";

export type TSortByType = "name" | "date" | "usage";
export type TSortType = "asc" | "desc";
export interface ISortingPayload {
  sortBy: TSortByType;
  sort: TSortType;
}

export type TKeysThatAreArray =
  | "product-classification"
  | "product-form"
  | "manufacture";

export interface IFilterProductsParams {
  "sort-by"?: TSortByType[];
  sort?: TSortType[];

  name?: string;
  "generic-name"?: string;
  description?: string;

  "product-classification"?: INameAndId[];
  "product-form"?: INameAndId[];
  manufacture?: INameAndId[];
}
