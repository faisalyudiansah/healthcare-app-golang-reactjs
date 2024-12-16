export interface IPharmacistOrderProducts {
  id: number;
  name: string;
  quantity: number;
  price: string;
  thumbnail_url: string;
}

export interface IPharmacistOrders {
  id: number;
  order_status: 'SENT' | 'WAITING' | 'PROCESSED' | 'CANCELLED' | 'CONFIRMED';
  voice_number: string;
  payment_url: string;
  total_amount: string;
  ship_cost: string;
  description: string;
  detail: {
    pharmacy: {
      id: number;
      name: string;
    };
    products: IPharmacistOrderProducts[];
  };
  // created_at: '2024-09-24T10:56:05.892824Z';
}
