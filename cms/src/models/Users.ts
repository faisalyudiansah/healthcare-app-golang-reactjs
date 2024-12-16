export interface IUserDetails {
  id: number;
  user_id: number;
  full_name: string;
  sipa_number: null;
  whatsapp_number: string;
  years_of_experience: number;
  image_url: string;
  // created_at: string;
  // updated_at: "2024-08-31T21:44:56.324565Z";
}
export interface IUser {
  role_id: 1 | 2 | 3;
  role: 'admin' | 'pharmacist';
  email: string;
  is_verified: boolean;
  user_detail: IUserDetails;
  address: unknown[];
  // created_at: string;
}

export interface IFilteredUser {
  id: number;
  name: string;
  email: string;
  sipa_number: string;
  whatsapp_number: string;
  years_of_experience: number;
  created_at: string;
  is_assigned: boolean;
}
