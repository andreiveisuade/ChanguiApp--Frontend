import { useState, useEffect, useCallback } from 'react';
import PurchaseRepository from '@/repositories/PurchaseRepository';
import { Purchase } from '@/types/domain';
import { AuthSessionExpiredError, UserFriendlyError } from '@/types/errors';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';

export type UsePurchaseHistoryReturn = {
  purchases: Purchase[];
  isLoading: boolean;
  error: UserFriendlyError | null;
  refresh: () => Promise<void>;
};

export const usePurchaseHistory = (): UsePurchaseHistoryReturn => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<UserFriendlyError | null>(null);

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await PurchaseRepository.getPurchases();
      setPurchases(data);
    } catch (err) {
      // 401 / sesión inválida: el httpClient ya limpió el storage y emitió el evento.
      // El AuthContext limpia estado y el guard del tabs layout redirige a login.
      if (err instanceof AuthSessionExpiredError) {
        return;
      }
      setError(ErrorTranslationService.translate(err));
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
