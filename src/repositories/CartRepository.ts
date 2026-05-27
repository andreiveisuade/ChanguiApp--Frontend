import AuthRepository from '@/repositories/AuthRepository';
import { CartWithItems, CartItemWithProduct } from '@/types/domain';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://changuiapp-backend.onrender.com';

export const CartRepository = {
  /**
   * Fetches the current active cart and its items.
   * Ensures standard bearer authentication using stored session token.
   */
  async getCart(): Promise<{ cart: CartWithItems | null; items: CartItemWithProduct[]; total: number }> {
    const session = await AuthRepository.getStoredSession();
    if (!session || !session.token) {
      throw new Error('No active session found. Please log in again.');
    }

    const response = await fetch(`${API_URL}/api/cart`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch cart';
      try {
        const errorData = await response.json();
        if (errorData && typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        } else if (errorData && typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        }
      } catch {
        // Silent catch: use default message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Map and normalize product relation name (could be product or products in backend JSON)
    const rawCart = data.cart;
    let mappedCart: CartWithItems | null = null;

    if (rawCart) {
      const rawCartItems = rawCart.cart_items ?? [];
      const mappedCartItems = rawCartItems.map((item: any) => {
        const product = item.product || item.products;
        return {
          id: item.id,
          cart_id: item.cart_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          created_at: item.created_at,
          updated_at: item.updated_at,
          product: product ? {
            id: product.id,
            name: product.name,
            barcode: product.barcode,
            brand: product.brand,
            image_url: product.image_url,
            price: product.price,
          } : null,
        };
      });

      mappedCart = {
        id: rawCart.id,
        user_id: rawCart.user_id,
        status: rawCart.status,
        created_at: rawCart.created_at,
        updated_at: rawCart.updated_at,
        cart_items: mappedCartItems,
      };
    }

    const rawItems = data.items ?? [];
    const mappedItems = rawItems.map((item: any) => {
      const product = item.product || item.products;
      return {
        id: item.id,
        cart_id: item.cart_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        created_at: item.created_at,
        updated_at: item.updated_at,
        product: product ? {
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          brand: product.brand,
          image_url: product.image_url,
          price: product.price,
        } : null,
      };
    });

    return {
      cart: mappedCart,
      items: mappedItems,
      total: typeof data.total === 'number' ? data.total : 0,
    };
  },
};

export default CartRepository;
