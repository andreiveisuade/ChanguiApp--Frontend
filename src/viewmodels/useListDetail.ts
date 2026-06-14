import { useState, useEffect, useCallback } from 'react';
import * as ListRepository from '@/repositories/ListRepository';
import { Product, ShoppingListItem } from '@/types/domain';
import { UserFriendlyError } from '@/types/errors';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';

export type UseListDetailReturn = {
  items: ShoppingListItem[];
  isLoading: boolean;
  error: UserFriendlyError | null;
  refresh: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  toggleItem: (itemId: string) => Promise<void>;
  setQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
};

/**
 * Ítems de una lista de compra (persistencia local, sin red). Las mutaciones
 * recargan en silencio para no parpadear el spinner en cada toggle/cantidad.
 */
export const useListDetail = (listId: string | undefined): UseListDetailReturn => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<UserFriendlyError | null>(null);

  const loadItems = useCallback(
    async (showSpinner: boolean) => {
      if (!listId) {
        setIsLoading(false);
        return;
      }
      if (showSpinner) setIsLoading(true);
      setError(null);
      try {
        const data = await ListRepository.getListItems(listId);
        setItems(data);
      } catch (err) {
        setError(ErrorTranslationService.translate(err));
      } finally {
        if (showSpinner) setIsLoading(false);
      }
    },
    [listId],
  );

  useEffect(() => {
    loadItems(true);
  }, [loadItems]);

  const refresh = useCallback(async () => {
    await loadItems(true);
  }, [loadItems]);

  const addProduct = useCallback(
    async (product: Product) => {
      if (!listId) return;
      try {
        await ListRepository.addItem(listId, product);
        await loadItems(false);
      } catch (err) {
        setError(ErrorTranslationService.translate(err));
      }
    },
    [listId, loadItems],
  );

  const toggleItem = useCallback(
    async (itemId: string) => {
      try {
        await ListRepository.toggleItem(itemId);
        await loadItems(false);
      } catch (err) {
        setError(ErrorTranslationService.translate(err));
      }
    },
    [loadItems],
  );

  const setQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        await ListRepository.setItemQuantity(itemId, quantity);
        await loadItems(false);
      } catch (err) {
        setError(ErrorTranslationService.translate(err));
      }
    },
    [loadItems],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        await ListRepository.deleteItem(itemId);
        await loadItems(false);
      } catch (err) {
        setError(ErrorTranslationService.translate(err));
      }
    },
    [loadItems],
  );

  return { items, isLoading, error, refresh, addProduct, toggleItem, setQuantity, removeItem };
};

export default useListDetail;
