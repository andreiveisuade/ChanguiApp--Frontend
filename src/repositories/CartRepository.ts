import { CartWithItems, CartItemWithProduct, TaxBreakdown, TaxSummary } from '@/types/domain';
import httpClient from '@/config/clients';
import {
  buildSummaryFromItems,
  calculateItemsTotal,
  hasSummaryValues,
} from '@/services/TaxSummaryService';

interface RawProduct {
  id: string;
  name: string;
  barcode: string;
  brand: string | null;
  image_url: string | null;
  price: number;
  tax?: TaxBreakdown;
}

interface RawCartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
  updated_at?: string;
  product?: RawProduct | null;
  products?: RawProduct | null;
}

interface RawCart {
  id: string;
  user_id: string;
  store_id?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  cart_items?: RawCartItem[];
}

interface GetCartResponse {
  cart: RawCart | null;
  items?: RawCartItem[];
  total?: number;
  summary?: TaxSummary;
}

interface Store {
  id: string;
}

/** Maps a raw backend cart item to the typed domain object. */
function mapRawItem(item: RawCartItem): CartItemWithProduct {
  const rawProduct = item.product || item.products;
  return {
    id: item.id,
    cart_id: item.cart_id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    created_at: item.created_at,
    updated_at: item.updated_at,
    product: rawProduct
      ? {
          id: rawProduct.id,
          name: rawProduct.name,
          barcode: rawProduct.barcode,
          brand: rawProduct.brand,
          image_url: rawProduct.image_url,
          price: rawProduct.price,
          tax: rawProduct.tax,
        }
      : null,
  };
}

export const CartRepository = {
  /**
   * Fetches the current active cart and its items.
   * Auth (bearer token) y manejo de 401 lo cubre el httpClient.
   */
  async getCart(): Promise<{
    cart: CartWithItems | null;
    items: CartItemWithProduct[];
    total: number;
    summary: TaxSummary;
  }> {
    const { data } = await httpClient.get<GetCartResponse>('/api/cart');

    const rawCart = data.cart;
    let mappedCart: CartWithItems | null = null;

    if (rawCart) {
      const rawCartItems: RawCartItem[] = rawCart.cart_items ?? [];
      const mappedCartItems = rawCartItems.map(mapRawItem);

      mappedCart = {
        id: rawCart.id,
        user_id: rawCart.user_id,
        store_id: rawCart.store_id ?? '',
        status: rawCart.status,
        created_at: rawCart.created_at,
        updated_at: rawCart.updated_at,
        cart_items: mappedCartItems,
      };
    }

    const rawItems: RawCartItem[] = data.items ?? [];
    const mappedItems = rawItems.map(mapRawItem);
    const itemsForTotals = mappedItems.length > 0 ? mappedItems : (mappedCart?.cart_items ?? []);
    const calculatedTotal = calculateItemsTotal(itemsForTotals);
    const total = typeof data.total === 'number' && data.total > 0 ? data.total : calculatedTotal;
    const summary = hasSummaryValues(data.summary)
      ? data.summary
      : buildSummaryFromItems(itemsForTotals, total);

    return {
      cart: mappedCart,
      items: mappedItems,
      total,
      summary,
    };
  },

  /**
   * Modifies the quantity of an item in the cart.
   * PUT /api/cart/items/{id}
   */
  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    await httpClient.put(`/api/cart/items/${itemId}`, { quantity });
  },

  /**
   * Deletes an item from the cart.
   * DELETE /api/cart/items/{id}
   */
  async deleteItem(itemId: string): Promise<void> {
    await httpClient.delete(`/api/cart/items/${itemId}`);
  },

  /**
   * Adds an item to the active cart. If no active cart exists,
   * it retrieves the available stores and associates the new cart with the first store.
   */
  async addItem(productId: string, quantity: number, unitPrice: number): Promise<void> {
    const { cart } = await this.getCart();

    let storeId: string | undefined = undefined;
    if (!cart) {
      const { data: stores } = await httpClient.get<Store[]>('/api/stores');
      if (stores && stores.length > 0) {
        storeId = stores[0].id;
      }
    }

    const body: Record<string, unknown> = {
      product_id: productId,
      quantity,
      unit_price: unitPrice,
    };
    if (storeId) {
      body.store_id = storeId;
    }

    await httpClient.post('/api/cart/items', body);
  },
};

export default CartRepository;
