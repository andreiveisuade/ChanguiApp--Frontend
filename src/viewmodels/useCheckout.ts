import { useState, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import CheckoutRepository from '@/repositories/CheckoutRepository';
import { AuthSessionExpiredError, UserFriendlyError } from '@/types/errors';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';

export type StartCheckoutResult = { preferenceId: string };

export type UseCheckoutReturn = {
  isStarting: boolean;
  error: UserFriendlyError | null;
  clearError: () => void;
  startCheckout: () => Promise<StartCheckoutResult | null>;
};

/**
 * Orquesta el checkout de Mercado Pago:
 * 1. Crea la preferencia en el backend, pasando el deep link de retorno.
 * 2. Abre el init_point de Checkout Pro con openAuthSessionAsync. MP redirige a
 *    la página de retorno del backend (auto_return) que reenvía al deep link, y
 *    expo-web-browser cierra el browser solo y devuelve el control a la app.
 *
 * Devuelve { preferenceId } para que la pantalla navegue a la confirmación, que
 * consulta el estado de forma determinista. Devuelve null si la sesión expiró o
 * hubo error.
 */
export const useCheckout = (): UseCheckoutReturn => {
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [error, setError] = useState<UserFriendlyError | null>(null);

  const startCheckout = useCallback(async (): Promise<StartCheckoutResult | null> => {
    setIsStarting(true);
    setError(null);
    try {
      const returnUrl = AuthSession.makeRedirectUri({ path: 'checkout/return' });

      const { init_point, preference_id } = await CheckoutRepository.createPreference(returnUrl);

      // openAuthSessionAsync intercepta el redirect al deep link y cierra el
      // browser solo. El resultado (success/cancel/dismiss) no cambia el flujo:
      // la confirmación se resuelve por estado, no por el tipo de cierre.
      await WebBrowser.openAuthSessionAsync(init_point, returnUrl);

      return { preferenceId: preference_id };
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
