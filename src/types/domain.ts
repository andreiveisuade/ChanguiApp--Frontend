export interface Product {
  id: string;
  name: string;
  barcode: string;
  brand: string;
  image_url: string | null;
  price: number;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface Cart {
  id: string;
  user_id: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface CartWithItems extends Cart {
  cart_items: CartItemWithProduct[];
}
