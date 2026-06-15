import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CartRepository from '@/repositories/CartRepository';
import { CartWithItems, CartItemWithProduct, TaxSummary } from '@/types/domain';
import { UserFriendlyError } from '@/types/errors';
import { translateQueryError } from '@/utils/queryError';

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
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['cart'],
    queryFn: () => CartRepository.getCart(),
  });

  // onSuccess retorna el invalidate para que mutateAsync espere el refetch.
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['cart'] });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      CartRepository.updateItemQuantity(itemId, quantity),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => CartRepository.deleteItem(itemId),
    onSuccess: invalidate,
  });

  const error = translateQueryError(query.error ?? updateMutation.error ?? removeMutation.error);

  const refresh = async (): Promise<void> => {
    // Limpia errores de mutaciones previas (antes lo hacía setError(null) en
    // el fetch) para que el pull-to-refresh / cerrar el banner los descarte.
    updateMutation.reset();
    removeMutation.reset();
    await query.refetch();
  };

  const updateQuantity = async (itemId: string, quantity: number): Promise<void> => {
    try {
      await updateMutation.mutateAsync({ itemId, quantity });
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
    cart: query.data?.cart ?? null,
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    summary: query.data?.summary ?? EMPTY_SUMMARY,
    isLoading: query.isPending || updateMutation.isPending || removeMutation.isPending,
    error,
    refresh,
    updateQuantity,
    removeItem,
  };
};

export default useCart;
