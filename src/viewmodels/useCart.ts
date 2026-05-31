import { useState, useEffect, useCallback } from 'react';
import CartRepository from '@/repositories/CartRepository';
import { CartWithItems, CartItemWithProduct } from '@/types/domain';
import { AuthSessionExpiredError } from '@/types/errors';

export type UseCartReturn = {
  cart: CartWithItems | null;
  items: CartItemWithProduct[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
};

export const useCart = (): UseCartReturn => {
  const [cart, setCart] = useState<CartWithItems | null>(null);
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await CartRepository.getCart();
      setCart(data.cart);
      setItems(data.items);
      setTotal(data.total);
    } catch (err: any) {
      // 401 / sesión inválida: apiFetch ya limpió el storage y emitió el evento.
      // El AuthContext va a limpiar estado y el guard del tabs layout redirige a login.
      // No exponemos el error al usuario para evitar flicker visual.
      if (err instanceof AuthSessionExpiredError) {
        return;
      }
      setError(err?.message || 'Error loading cart');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const refresh = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await CartRepository.updateItemQuantity(itemId, quantity);
      await fetchCart();
    } catch (err: any) {
      setError(err?.message || 'Error updating quantity');
      setIsLoading(false);
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (itemId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await CartRepository.deleteItem(itemId);
      await fetchCart();
    } catch (err: any) {
      setError(err?.message || 'Error removing item');
      setIsLoading(false);
    }
  }, [fetchCart]);

  return {
    cart,
    items,
    total,
    isLoading,
    error,
    refresh,
    updateQuantity,
    removeItem,
  };
};

export default useCart;
