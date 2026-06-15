import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ListRepository from '@/repositories/ListRepository';
import { ShoppingList } from '@/types/domain';
import { UserFriendlyError } from '@/types/errors';
import { translateQueryError } from '@/utils/queryError';

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
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['lists'],
    queryFn: () => ListRepository.getLists(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['lists'] });

  const createMutation = useMutation({
    mutationFn: (name: string) => ListRepository.createList(name),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (listId: string) => ListRepository.deleteList(listId),
    onSuccess: invalidate,
  });

  const error = translateQueryError(query.error ?? createMutation.error ?? deleteMutation.error);

  const refresh = async (): Promise<void> => {
    createMutation.reset();
    deleteMutation.reset();
    await query.refetch();
  };

  const createList = async (name: string): Promise<void> => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await createMutation.mutateAsync(trimmed);
    } catch {
      // El error se expone vía `error`.
    }
  };

  const deleteList = async (listId: string): Promise<void> => {
    try {
      await deleteMutation.mutateAsync(listId);
    } catch {
      // El error se expone vía `error`.
    }
  };

  return {
    lists: query.data ?? [],
    isLoading: query.isPending,
    error,
    refresh,
    createList,
    deleteList,
  };
};

export default useLists;
