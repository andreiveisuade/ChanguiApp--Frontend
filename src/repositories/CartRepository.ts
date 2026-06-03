import { apiFetch } from '@/utils/apiFetch';
import { CartWithItems, CartItemWithProduct } from '@/types/domain';

interface RawProduct {
  id: string;
  name: string;
  barcode: string;
  brand: string | null;
  image_url: string | null;
  price: number;
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
        }
      : null,
  };
}

export const CartRepository = {
  /**
   * Fetches the current active cart and its items.
   * Auth (bearer token) y manejo de 401 lo cubre apiFetch.
   */
  async getCart(): Promise<{ cart: CartWithItems | null; items: CartItemWithProduct[]; total: number }> {
    const response = await apiFetch('/api/cart');
    const data = await response.json();

    // Map and normalize product relation name (could be product or products in backend JSON)
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

    return {
      cart: mappedCart,
      items: mappedItems,
      total: typeof data.total === 'number' ? data.total : 0,
    };
  },

  /**
   * Modifies the quantity of an item in the cart.
   * PUT /api/cart/items/{id}
   */
  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    await apiFetch(`/api/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  /**
   * Deletes an item from the cart.
   * DELETE /api/cart/items/{id}
   */
  async deleteItem(itemId: string): Promise<void> {
    await apiFetch(`/api/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },
};

export default CartRepository;
