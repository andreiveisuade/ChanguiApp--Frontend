export type PurchaseItem = {
  id: string | number;
  product_name: string;
  quantity: number;
  price: number;
};

export type Purchase = {
  id: string | number;
  store_name: string;
  store_location?: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  total: number;
  subtotal: number;
  service_fee: number;
  created_at: string;
  payment_method?: string;
  items: PurchaseItem[];
};