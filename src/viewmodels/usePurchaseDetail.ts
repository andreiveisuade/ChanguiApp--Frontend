import { useState, useEffect, useCallback } from 'react';
import PurchaseRepository from '@/repositories/PurchaseRepository';
import { PurchaseDetail } from '@/types/domain';
import { AuthSessionExpiredError, UserFriendlyError } from '@/types/errors';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';

export type UsePurchaseDetailReturn = {
  purchase: PurchaseDetail | null;
  isLoading: boolean;
  error: UserFriendlyError | null;
  refresh: () => Promise<void>;
};

export const usePurchaseDetail = (id: string | undefined): UsePurchaseDetailReturn => {
  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<UserFriendlyError | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await PurchaseRepository.getPurchaseById(id);
      setPurchase(data);
    } catch (err) {
      // 401 / sesión inválida: el httpClient ya limpió el storage y emitió el evento.
      if (err instanceof AuthSessionExpiredError) {
        return;
      }
      setError(ErrorTranslationService.translate(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const refresh = useCallback(async () => {
    await fetchDetail();
  }, [fetchDetail]);

  return { purchase, isLoading, error, refresh };
};

export default usePurchaseDetail;
