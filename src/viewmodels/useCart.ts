import { useState, useEffect, useCallback } from 'react';
import CartRepository from '@/repositories/CartRepository';
import { CartWithItems, CartItemWithProduct, TaxSummary } from '@/types/domain';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';
import { UserFriendlyError } from '@/types/errors';
import { useAsyncAction } from '@/hooks/useAsyncAction';

const EMPTY_SUMMARY: TaxSummary = { subtotal_net: 0, taxes: [], total: 0 };

export type UseCartReturn = {
  cart: CartWithItems | null;
  items: CartItemWithProduct[];
  total: number;
  summary: TaxSummary;
  isLoading: boolean;
  error: UserFriendlyError | null;
  refresh: () => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
};

export const useCart = (): UseCartReturn => {
  const [cart, setCart] = useState<CartWithItems | null>(null);
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [summary, setSummary] = useState<TaxSummary>(EMPTY_SUMMARY);
  const { isLoading, error, setError, setIsLoading, run } = useAsyncAction(true);

  const fetchCart = useCallback(async () => {
    const data = await run(() => CartRepository.getCart());
    if (data) {
      setCart(data.cart);
      setItems(data.items);
      setTotal(data.total);
      setSummary(data.summary);
    }
  }, [run]);

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
    } catch (err) {
      setError(ErrorTranslationService.translate(err));
      setIsLoading(false);
    }
  }, [fetchCart, setError, setIsLoading]);

  const removeItem = useCallback(async (itemId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await CartRepository.deleteItem(itemId);
      await fetchCart();
    } catch (err) {
      setError(ErrorTranslationService.translate(err));
      setIsLoading(false);
    }
  }, [fetchCart, setError, setIsLoading]);

  return {
    cart,
    items,
    total,
    summary,
    isLoading,
    error,
    refresh,
    updateQuantity,
    removeItem,
  };
};

export default useCart;
