import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import CheckoutRepository from '@/repositories/CheckoutRepository';

export type CheckoutStatus = 'checking' | 'success' | 'pending' | 'timeout';

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 24; // ~60s de margen para que llegue el webhook

export type UseCheckoutStatusReturn = {
  status: CheckoutStatus;
  retry: () => void;
};

/**
 * Resuelve el resultado del pago tras volver del checkout de Mercado Pago.
 *
 * La compra la crea el webhook de forma asíncrona, así que polleamos
 * GET /api/purchases comparando el top id contra el que había antes de pagar
 * (prevTopId). Si aparece una compra nueva:
 *   - completed → success
 *   - aún no completed al agotar los intentos → pending
 * Si no aparece ninguna → timeout.
 *
 * Re-pollea al volver la app a foreground (AppState) para cubrir el cierre
 * del Custom Tab en Android.
 */
export const useCheckoutStatus = (prevTopId: string): UseCheckoutStatusReturn => {
  const [status, setStatus] = useState<CheckoutStatus>('checking');
  const [retryKey, setRetryKey] = useState<number>(0);
  const attemptsRef = useRef<number>(0);

  const checkOnce = useCallback(async (): Promise<boolean> => {
    try {
      const list = await CheckoutRepository.listPurchaseStatuses();
      const top = list[0];
      if (top && top.id !== prevTopId && top.payment_status === 'completed') {
        setStatus('success');
        return true;
      }
    } catch {
      // Error transitorio de red: ignoramos y seguimos polleando.
    }
    return false;
  }, [prevTopId]);

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
        const list = await CheckoutRepository.listPurchaseStatuses().catch(() => []);
        const top = list[0];
        if (active) {
          setStatus(top && top.id !== prevTopId ? 'pending' : 'timeout');
        }
        return;
      }
      timer = setTimeout(tick, POLL_INTERVAL_MS);
    };

    void tick();

    // Al volver del browser (foreground) reiniciamos la ventana de intentos:
    // en Android openBrowserAsync puede resolver al abrir, no al cerrar.
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
  }, [checkOnce, prevTopId, retryKey]);

  return { status, retry };
};

export default useCheckoutStatus;
