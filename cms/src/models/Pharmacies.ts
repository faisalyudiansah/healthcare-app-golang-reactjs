export interface PharmacyDetail {
  id: number;
  name: string;
  address: string;
  city: string;
  pharmacist: {
    id: number;
    name: string;
  };
  partner: {
    id: number;
    name: string;
  };
  logistics: logistics[];
  latitude: number;
  longitude: number;
  is_active: true;
}

export interface IPharmacy {
  id: number;
  name: string;
  address: string;
  city: string;
  pharmacist: {
    id: number;
    name: string;
  };
  partner: {
    id: number;
    name: string;
  };
  is_active: boolean;
}

export interface IPharmacyProduct {
  id: number;
  product: {
    name: string;
  };
  stock_quantity: number;
  price: string;
  is_active: boolean;
  logistics: logistics[];
  latitude: number;
  longitude: number;
}

export interface logistics {
  id: number;
  code: string;
  service: string;
}
