import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import CheckoutRepository, { CheckoutPaymentStatus } from '@/repositories/CheckoutRepository';

export type CheckoutStatus = 'checking' | 'success' | 'pending' | 'timeout';

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 24; // ~60s de margen para que llegue el webhook

export type UseCheckoutStatusReturn = {
  status: CheckoutStatus;
  retry: () => void;
};

/**
 * Resuelve el resultado del pago consultando el estado de forma determinista:
 * GET /api/checkout/status?preference_id=. La compra la crea el webhook de
 * forma asíncrona, así que polleamos hasta que pase a 'completed'.
 *   - completed → success
 *   - aún pending al agotar los intentos → pending
 *   - nunca aparece (not_found) → timeout
 *
 * Re-pollea al volver la app a foreground (AppState) para cubrir el cierre del
 * Custom Tab en Android.
 */
export const useCheckoutStatus = (preferenceId: string): UseCheckoutStatusReturn => {
  const [status, setStatus] = useState<CheckoutStatus>('checking');
  const [retryKey, setRetryKey] = useState<number>(0);
  const attemptsRef = useRef<number>(0);
  const lastStatusRef = useRef<CheckoutPaymentStatus>('not_found');

  const checkOnce = useCallback(async (): Promise<boolean> => {
    if (!preferenceId) return false;
    try {
      const { status: paymentStatus } = await CheckoutRepository.getStatus(preferenceId);
      lastStatusRef.current = paymentStatus;
      if (paymentStatus === 'completed') {
        setStatus('success');
        return true;
      }
    } catch {
      // Error transitorio de red: ignoramos y seguimos polleando.
    }
    return false;
  }, [preferenceId]);

  const retry = useCallback(() => {
    attemptsRef.current = 0;
    setStatus('checking');
    setRetryKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async (): Promise<void> => {
      if (!active) return;
      const done = await checkOnce();
      if (done || !active) return;

      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        if (active) {
          setStatus(lastStatusRef.current === 'pending' ? 'pending' : 'timeout');
        }
        return;
      }
      timer = setTimeout(tick, POLL_INTERVAL_MS);
    };

    void tick();

    // Al volver del browser (foreground) reiniciamos la ventana de intentos:
    // en Android openAuthSessionAsync puede resolver al abrir, no al cerrar.
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        attemptsRef.current = 0;
        void checkOnce();
      }
    });

    return () => {
      active = false;
      clearTimeout(timer);
      sub.remove();
    };
  }, [checkOnce, retryKey]);

  return { status, retry };
};

export default useCheckoutStatus;
