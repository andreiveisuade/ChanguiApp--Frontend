import { useState, useEffect, useCallback } from 'react';
import PurchaseRepository from '@/repositories/PurchaseRepository';
import { PurchaseDetail } from '@/types/domain';
import { AuthSessionExpiredError } from '@/types/errors';

export type UsePurchaseDetailReturn = {
  purchase: PurchaseDetail | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export const usePurchaseDetail = (id: string | undefined): UsePurchaseDetailReturn => {
  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      // 401 / sesión inválida: apiFetch ya limpió el storage y emitió el evento.
      if (err instanceof AuthSessionExpiredError) {
        return;
      }
      // El manejo de errores de red y HTTP se unifica en DEV-180.
      console.error('[usePurchaseDetail] fetchDetail:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
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
