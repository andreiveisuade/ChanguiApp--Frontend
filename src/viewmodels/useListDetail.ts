import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ListRepository from '@/repositories/ListRepository';
import { Product, ShoppingListItem } from '@/types/domain';
import { UserFriendlyError } from '@/types/errors';
import { translateQueryError } from '@/utils/queryError';

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
 * invalidan en background (sin spinner) y también el índice de listas, cuyos
 * contadores de ítems/comprados cambian.
 */
export const useListDetail = (listId: string | undefined): UseListDetailReturn => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['list', listId],
    queryFn: () => ListRepository.getListItems(listId as string),
    enabled: Boolean(listId),
  });

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['list', listId] }),
      queryClient.invalidateQueries({ queryKey: ['lists'] }),
    ]);

  const addMutation = useMutation({
    mutationFn: (product: Product) => ListRepository.addItem(listId as string, product),
    onSuccess: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: (itemId: string) => ListRepository.toggleItem(itemId),
    onSuccess: invalidate,
  });

  const quantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      ListRepository.setItemQuantity(itemId, quantity),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => ListRepository.deleteItem(itemId),
    onSuccess: invalidate,
  });

  const error = translateQueryError(
    query.error ??
      addMutation.error ??
      toggleMutation.error ??
      quantityMutation.error ??
      removeMutation.error,
  );

  const refresh = async (): Promise<void> => {
    await query.refetch();
  };

  const addProduct = async (product: Product): Promise<void> => {
    if (!listId) return;
    try {
      await addMutation.mutateAsync(product);
    } catch {
      // El error se expone vía `error`.
    }
  };

  const toggleItem = async (itemId: string): Promise<void> => {
    try {
      await toggleMutation.mutateAsync(itemId);
    } catch {
      // El error se expone vía `error`.
    }
  };

  const setQuantity = async (itemId: string, quantity: number): Promise<void> => {
    try {
      await quantityMutation.mutateAsync({ itemId, quantity });
    } catch {
      // El error se expone vía `error`.
    }
  };

  const removeItem = async (itemId: string): Promise<void> => {
    try {
      await removeMutation.mutateAsync(itemId);
    } catch {
      // El error se expone vía `error`.
    }
  };

  return {
    items: query.data ?? [],
    isLoading: Boolean(listId) && query.isPending,
    error,
    refresh,
    addProduct,
    toggleItem,
    setQuantity,
    removeItem,
  };
};

export default useListDetail;
