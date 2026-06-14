export interface TaxBreakdown {
  category: string;
  rate: number;
  net_price: number;
  tax_amount: number;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  brand: string | null;
  image_url: string | null;
  price: number;
  tax?: TaxBreakdown;
}

export interface TaxLine {
  rate: number;
  label: string;
  base: number;
  amount: number;
}

export interface TaxSummary {
  subtotal_net: number;
  taxes: TaxLine[];
  total: number;
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
  store_id: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItemWithProduct extends CartItem {
  product: Product | null;
}

export interface CartWithItems extends Cart {
  cart_items: CartItemWithProduct[];
}

export interface ShoppingList {
  id: string;
  name: string;
  total_items: number;
  done_items: number;
  created_at?: string;
}

export interface ShoppingListItem {
  id: string;
  list_id: string;
  // Snapshot del producto del catálogo al momento de agregarlo: conserva el
  // precio de ese momento y sobrevive a cambios/borrados del catálogo.
  barcode: string;
  name: string;
  brand: string | null;
  price: number;
  image_url: string | null;
  quantity: number;
  purchased: boolean;
  created_at?: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Purchase {
  id: string;
  store_name: string | null;
  date: string;
  total: number;
  status: PaymentStatus;
  // Solo disponible en el detalle; el listado no devuelve el conteo de items.
  item_count?: number;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_name: string;
  barcode: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
}

export interface PurchaseDetail extends Purchase {
  items: PurchaseItem[];
  summary?: TaxSummary;
}
