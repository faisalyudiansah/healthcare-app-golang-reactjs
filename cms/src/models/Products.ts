export interface INameAndId {
  id: number;
  name: string;
}

export const InitialINameAndId: INameAndId = {
  id : 0,
  name : ''
}

export interface ISearchData {
  id: number;
  name: string;
}

export interface IFilteredProduct {
  id: number;
  name: string;
  thumbnail_url: string;
  sold_amount: number;
  selling_unit: string;
  product_classification: {
    id: number;
    name: string;
  };
}

export interface IProductDetails {
  name: string;
  generic_name: string;
  description: string;
  unit_in_pack: string;
  selling_unit: string;
  sold_amount: number;
  weight: string;
  height: string;
  length: string;
  width: string;
  thumbnail_url: string;
  image_url: string;
  is_active: boolean;

  manufacture: INameAndId;
  product_categories: INameAndId[];
  product_classification: INameAndId;
  product_form: INameAndId;
}
