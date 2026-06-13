import { useState, useEffect, useCallback } from 'react';
import ListRepository from '@/repositories/ListRepository';
import { ShoppingList } from '@/types/domain';
import { UserFriendlyError } from '@/types/errors';
import { useAsyncAction } from '@/hooks/useAsyncAction';

export type UseListsReturn = {
  lists: ShoppingList[];
  isLoading: boolean;
  error: UserFriendlyError | null;
  refresh: () => Promise<void>;
  createList: (name: string) => Promise<void>;
};

export const useLists = (): UseListsReturn => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const { isLoading, error, run } = useAsyncAction(true);

  const fetchLists = useCallback(async () => {
    const data = await run(() => ListRepository.getLists());
    if (data) setLists(data);
  }, [run]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const refresh = useCallback(async () => {
    await fetchLists();
  }, [fetchLists]);

  const createList = useCallback(
    async (name: string) => {
      await run(async () => {
        await ListRepository.createList(name);
        const data = await ListRepository.getLists();
        setLists(data);
      });
    },
    [run]
  );

  return { lists, isLoading, error, refresh, createList };
};

export default useLists;
