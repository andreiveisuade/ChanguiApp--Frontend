import { useState, useEffect, useCallback } from 'react';
import * as ListRepository from '@/repositories/ListRepository';
import { ShoppingList } from '@/types/domain';
import { UserFriendlyError } from '@/types/errors';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';

export type UseListsReturn = {
  lists: ShoppingList[];
  isLoading: boolean;
  error: UserFriendlyError | null;
  refresh: () => Promise<void>;
  createList: (name: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
};

/** Índice de listas de compra (persistencia local, sin red). */
export const useLists = (): UseListsReturn => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<UserFriendlyError | null>(null);

  const fetchLists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ListRepository.getLists();
      setLists(data);
    } catch (err) {
      setError(ErrorTranslationService.translate(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const refresh = useCallback(async () => {
    await fetchLists();
  }, [fetchLists]);

  const createList = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      try {
        await ListRepository.createList(trimmed);
        await fetchLists();
      } catch (err) {
        setError(ErrorTranslationService.translate(err));
      }
    },
    [fetchLists],
  );

  const deleteList = useCallback(
    async (listId: string) => {
      try {
        await ListRepository.deleteList(listId);
        await fetchLists();
      } catch (err) {
        setError(ErrorTranslationService.translate(err));
      }
    },
    [fetchLists],
  );

  return { lists, isLoading, error, refresh, createList, deleteList };
};

export default useLists;
