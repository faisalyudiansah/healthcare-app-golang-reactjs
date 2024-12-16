import { INameAndId } from "../../models/Products";

export type ProgressStatus = "inprogress" | "completed" | "none";

export interface ProgressDetail {
  step: number;
  name: string;
  status: ProgressStatus;
}

export interface CreateProductCategory {
  id?: number;
  name?: string;
}

export interface AddProductForm {
  categories?: CreateProductCategory[];
  classification?: number;

  productName?: string;
  genericName?: string;
  description?: string;
  manufacturer?: INameAndId | null;

  productForm?: INameAndId | null;
  sellingUnit?: string;
  unitInPack?: string;

  thumbnailImg?: File | null;
  firstImg?: File | null;
  secondImg?: File | null;
  thirdImg?: File | null;
  shouldShow2ndImg?: boolean;
  shouldShow3rdImg?: boolean;

  height?: number;
  weight?: number;
  length?: number;
  width?: number;
  isActive?: boolean;
}

// THE STATE USED IN SLICE
export interface AddProductState {
  progresses: ProgressDetail[];
  form: AddProductForm;
}
