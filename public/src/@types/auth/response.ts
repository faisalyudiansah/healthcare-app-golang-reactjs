// success
export type SuccessLoginAPI = {
    message: string;
    data: {
        access_token: string;
    },
}

export type SuccessRegisterAPI = {
    message: string;
    data: {
        id: string;
        email: string;
        is_verified: boolean;
        role_id: number;
        role: string;
        created_at: string;
    },
}

export interface SuccessGetMeAPI {
    message: string;
    data: UserData;
}

export interface UserDetail {
    id: number;
    user_id: number;
    full_name: string;
    sipa_number: string;
    whatsapp_number: string;
    years_of_experience: number;
    image_url: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface UserData {
    id: number;
    role_id: number;
    role: string;
    email: string;
    is_verified: boolean;
    user_detail: UserDetail | null
    address: Address[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface Address {
    id: number;
    userId: number;
    is_active: boolean;
    address: string;
    province: string;
    city: string;
    city_id: number
    district: string;
    sub_district: string;
    latitude: string;
    longitude: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface JwtPayload {
    iss: string;
    exp: number;
    iat: number;
    jti: string;
    user_id: number;
    role: number;
}