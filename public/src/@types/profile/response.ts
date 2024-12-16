export interface Address {
    id: number;
    userId: number;
    is_active: boolean;
    address: string;
    contact_name?: string;
    contact_phone_number?: string;
    province: string;
    city: string;
    city_id: number;
    district: string;
    sub_district: string;
    latitude: string;
    longitude: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface SuccessGetMyAddressAPI {
    message: string;
    data: Address[];
}

export interface SuccessGetSingleMyAddressAPI {
    message: string;
    data: Address;
}