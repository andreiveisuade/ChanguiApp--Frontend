import { useQuery } from '@tanstack/react-query';
import PurchaseRepository from '@/repositories/PurchaseRepository';
import { PurchaseDetail } from '@/types/domain';
import { UserFriendlyError } from '@/types/errors';
import { translateQueryError } from '@/utils/queryError';

export type UsePurchaseDetailReturn = {
  purchase: PurchaseDetail | null;
  isLoading: boolean;
  error: UserFriendlyError | null;
  refresh: () => Promise<void>;
};

export const usePurchaseDetail = (id: string | undefined): UsePurchaseDetailReturn => {
  const query = useQuery({
    queryKey: ['purchase', id],
    queryFn: () => PurchaseRepository.getPurchaseById(id as string),
    enabled: Boolean(id),
  });

  const refresh = async (): Promise<void> => {
    await query.refetch();
  };

  return {
    purchase: query.data ?? null,
    isLoading: Boolean(id) && query.isPending,
    error: translateQueryError(query.error),
    refresh,
  };
};

export default usePurchaseDetail;
