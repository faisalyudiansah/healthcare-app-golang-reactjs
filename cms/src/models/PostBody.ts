export interface ICreateProduct {
  name: string;
  generic_name: string;
  description: string;
  manufacture_id: string;
  product_classification_id: string;
  product_categories: string[];
  product_form_id: string;
  selling_unit: string;
  unit_in_pack: string;

  thumbnail: File;
  image: File;
  secondary_image: File;
  tertiary_image: File;

  weight: string;
  height: string;
  length: string;
  width: string;
  is_active: string;
}
