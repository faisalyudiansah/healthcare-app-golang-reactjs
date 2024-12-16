import { Paging, PharmacyInfo, ProductDetails } from "../cartSlices";

export interface OrderResponse {
  message: string;
  data: Order[];
  paging: Paging;
}

export interface ProductInfo {
  id: number;
  order_id: number;
  pharmacy_product_id: number;
  quantity: number;
  price: string;
  product: ProductDetails;
}

export interface Order {
  id: number;
  user_id: number;
  order_status: "WAITING" | "PROCESSED" | "SENT" | "CONFIRMED" | "CANCELLED";
  voice_number: string;
  payment_img_url: string | null;
  customer_email: string;
  customer_name: string;
  total_product_price: number;
  ship_cost: number;
  total_payment: number;
  description: string;
  address: string;
  pharmacy_info: PharmacyInfo;
  product_info: ProductInfo[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
