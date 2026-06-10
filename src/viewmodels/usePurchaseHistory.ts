import { useState, useEffect, useCallback } from 'react';
import PurchaseRepository from '@/repositories/PurchaseRepository';
import { Purchase } from '@/types/domain';
import { AuthSessionExpiredError } from '@/types/errors';

export type UsePurchaseHistoryReturn = {
  purchases: Purchase[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export const usePurchaseHistory = (): UsePurchaseHistoryReturn => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await PurchaseRepository.getPurchases();
      setPurchases(data);
    } catch (err) {
      // 401 / sesión inválida: apiFetch ya limpió el storage y emitió el evento.
      // El AuthContext limpia estado y el guard del tabs layout redirige a login.
      if (err instanceof AuthSessionExpiredError) {
        return;
      }
      // El manejo de errores de red y HTTP se unifica en DEV-180.
      // Cuando se mergee, esta línea se reemplaza por:
      // setError(ErrorTranslationService.translate(err));
      console.error('[usePurchaseHistory] fetchPurchases:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const refresh = useCallback(async () => {
    await fetchPurchases();
  }, [fetchPurchases]);

  return { purchases, isLoading, error, refresh };
};

export default usePurchaseHistory;
