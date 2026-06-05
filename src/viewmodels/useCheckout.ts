import { useState, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import CheckoutRepository from '@/repositories/CheckoutRepository';
import { AuthSessionExpiredError, UserFriendlyError } from '@/types/errors';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';

export type StartCheckoutResult = { prevTopId: string };

export type UseCheckoutReturn = {
  isStarting: boolean;
  error: UserFriendlyError | null;
  clearError: () => void;
  startCheckout: () => Promise<StartCheckoutResult | null>;
};

/**
 * Orquesta el inicio del checkout de Mercado Pago:
 * 1. Toma el id de la compra más reciente (para detectar la nueva al volver).
 * 2. Crea la preferencia en el backend.
 * 3. Abre el init_point de Checkout Pro en el browser in-app.
 *
 * Devuelve { prevTopId } cuando el browser se cerró, para que la pantalla
 * navegue a la confirmación. Devuelve null si la sesión expiró o hubo error.
 * El backend no usa back_urls: la compra la crea el webhook de forma
 * asíncrona, así que la confirmación se resuelve por polling (useCheckoutStatus).
 */
export const useCheckout = (): UseCheckoutReturn => {
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [error, setError] = useState<UserFriendlyError | null>(null);

  const startCheckout = useCallback(async (): Promise<StartCheckoutResult | null> => {
    setIsStarting(true);
    setError(null);
    try {
      const before = await CheckoutRepository.listPurchaseStatuses();
      const prevTopId = before[0]?.id ?? '';

      const { init_point } = await CheckoutRepository.createPreference();
      await WebBrowser.openBrowserAsync(init_point);

      return { prevTopId };
    } catch (err) {
      if (err instanceof AuthSessionExpiredError) {
        return null;
      }
      setError(ErrorTranslationService.translate(err));
      return null;
    } finally {
      setIsStarting(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { isStarting, error, clearError, startCheckout };
};

export default useCheckout;
