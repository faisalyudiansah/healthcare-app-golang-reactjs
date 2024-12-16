export interface FormOne {
  productName: string;
  genericName: string;
  description: string;
  manufacturer: string;
}

export interface FormTwo {
  drugClf: string;
  categories: string[];
}

export interface FormThree {
  productForm?: string;
  sellingUnit: string;
  unitInPack: string;
}

export interface FormFour {
  thumbnailImg: File | null;
  firstImg: File | null;
  secondImg?: File | null;
  thirdImg?: File | null;

  height: number;
  weight: number;
  length: number;
  width: number;
  isActive: boolean;
}
