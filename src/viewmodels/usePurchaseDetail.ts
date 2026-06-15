import { useState, useEffect, useCallback } from 'react';
import PurchaseRepository from '@/repositories/PurchaseRepository';
import { PurchaseDetail } from '@/types/domain';
import { UserFriendlyError } from '@/types/errors';
import { useAsyncAction } from '@/hooks/useAsyncAction';

export type UsePurchaseDetailReturn = {
  purchase: PurchaseDetail | null;
  isLoading: boolean;
  error: UserFriendlyError | null;
  refresh: () => Promise<void>;
};

export const usePurchaseDetail = (id: string | undefined): UsePurchaseDetailReturn => {
  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null);
  const { isLoading, error, run } = useAsyncAction(Boolean(id));

  const fetchDetail = useCallback(async () => {
    if (!id) {
      return;
    }
    const data = await run(() => PurchaseRepository.getPurchaseById(id));
    if (data) {
      setPurchase(data);
    }
  }, [id, run]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const refresh = useCallback(async () => {
    await fetchDetail();
  }, [fetchDetail]);

  return { purchase, isLoading, error, refresh };
};

export default usePurchaseDetail;
