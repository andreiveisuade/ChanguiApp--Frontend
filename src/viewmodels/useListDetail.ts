import { useState, useEffect, useCallback } from 'react';
import ListRepository from '@/repositories/ListRepository';
import { ShoppingListItem } from '@/types/domain';
import { UserFriendlyError } from '@/types/errors';
import { useAsyncAction } from '@/hooks/useAsyncAction';

export type UseListDetailReturn = {
  items: ShoppingListItem[];
  isLoading: boolean;
  error: UserFriendlyError | null;
  refresh: () => Promise<void>;
  addItem: (name: string) => Promise<void>;
  toggleItem: (item: ShoppingListItem) => Promise<void>;
  removeList: () => Promise<boolean>;
};

export const useListDetail = (listId: string): UseListDetailReturn => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const { isLoading, error, run } = useAsyncAction(true);

  const fetchDetail = useCallback(async () => {
    const data = await run(() => ListRepository.getList(listId));
    if (data) setItems(data.items);
  }, [run, listId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const refresh = useCallback(async () => {
    await fetchDetail();
  }, [fetchDetail]);

  const addItem = useCallback(
    async (name: string) => {
      const item = await run(() => ListRepository.addItem(listId, name));
      if (item) setItems((prev) => [...prev, item]);
    },
    [run, listId]
  );

  const toggleItem = useCallback(
    async (item: ShoppingListItem) => {
      const updated = await run(() => ListRepository.setPurchased(listId, item.id, !item.purchased));
      if (updated) setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    },
    [run, listId]
  );

  const removeList = useCallback(async (): Promise<boolean> => {
    const result = await run(async () => {
      await ListRepository.deleteList(listId);
      return true;
    });
    return result === true;
  }, [run, listId]);

  return { items, isLoading, error, refresh, addItem, toggleItem, removeList };
};

export default useListDetail;
