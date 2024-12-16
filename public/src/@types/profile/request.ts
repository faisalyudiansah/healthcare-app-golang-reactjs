export type RequestUpdateProfile = {
    full_name: string | undefined;
    whatsapp_number: string | undefined;
    image_url: string | undefined;
};

export interface RequestAddress {
    contact_name?: string;
    contact_phone_number?: string;
    address?: string;
    province?: string;
    city?: string;
    city_id?: number;
    district?: string;
    sub_district?: string;
    latitude?: string;
    longitude?: string;
  }
  