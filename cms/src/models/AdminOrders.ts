export interface IAdminProductDetails {
  id: number;
  name: string;
  quantity: number;
  price: string;
  thumbnail_url: string;
}

export interface IAdminOrder {
  id: number;
  order_status: 'SENT' | 'WAITING' | 'PROCESSED' | 'CANCELLED' | 'CONFIRMED';
  voice_number: string;
  payment_url: string | null;
  total_product_price: string;
  ship_cost: string;
  description: string;
  detail: {
    pharmacy: {
      id: number;
      name: string;
    };
    products: IAdminProductDetails[];
  };
  created_at: string;
}
