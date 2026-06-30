import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CartRepository from '@/repositories/CartRepository';
import { CartItemWithProduct, CartWithItems, TaxSummary } from '@/types/domain';
import { UserFriendlyError } from '@/types/errors';
import { translateQueryError } from '@/utils/queryError';
import { buildSummaryFromItems, calculateItemsTotal } from '@/services/TaxSummaryService';

const EMPTY_SUMMARY: TaxSummary = { subtotal_net: 0, taxes: [], total: 0 };

// Ventana de coalescencia: cada toque al +/- reprograma el envío, así que una
// ráfaga de toques se resuelve en un único PUT con la cantidad final. El carrito
// y el total se actualizan al instante de forma optimista; el backend se entera
// recién cuando el usuario deja de tocar.
const DEBOUNCE_MS = 500;

type CartData = {
  cart: CartWithItems | null;
  items: CartItemWithProduct[];
  total: number;
  summary: TaxSummary;
};

export type UseCartReturn = {
  cart: CartWithItems | null;
  items: CartItemWithProduct[];
  total: number;
  summary: TaxSummary;
  isLoading: boolean;
  isRefreshing: boolean;
  error: UserFriendlyError | null;
  refresh: () => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  /** Fuerza el envío inmediato de cambios de cantidad pendientes (debounce). */
  flushPending: () => Promise<void>;
};

const CART_QUERY_KEY = ['cart'] as const;

export const useCart = (): UseCartReturn => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => CartRepository.getCart(),
  });

  // Timers de debounce y cantidad objetivo por ítem, en refs para no re-renderizar
  // en cada toque ni perder los valores entre renders.
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pendingRef = useRef<Map<string, number>>(new Map());
  // PUT en vuelo por ítem: encadenar sobre él garantiza que las cantidades lleguen
  // al backend en orden y un envío viejo no pise al más reciente del mismo ítem.
  const inFlightRef = useRef<Map<string, Promise<void>>>(new Map());
  const [mutationError, setMutationError] = useState<unknown>(null);

  // Recalcula total + desglose localmente para que el precio se vea en tiempo real
  // sin esperar al backend (misma regla fiscal que usa el repositorio como fallback).
  // Funciones envueltas en useCallback para que su identidad sea estable entre
  // renders: así CartItem (React.memo) solo se repinta cuando cambia su propio
  // ítem, no cuando se toca el +/- de otro.
  const setLocalItems = useCallback(
    (updater: (items: CartItemWithProduct[]) => CartItemWithProduct[]): void => {
      queryClient.setQueryData<CartData>(CART_QUERY_KEY, (prev) => {
        if (!prev) return prev;
        const items = updater(prev.items);
        const total = calculateItemsTotal(items);
        const summary = buildSummaryFromItems(items, total);
        const cart = prev.cart ? { ...prev.cart, cart_items: items } : prev.cart;
        return { ...prev, items, cart, total, summary };
      });
    },
    [queryClient],
  );

  // Envía al backend la última cantidad pendiente de un ítem, encadenado sobre el
  // PUT en vuelo del mismo ítem. Ante error, revierte pidiendo el estado real y
  // relanza para que flushPending (pago) pueda abortar el checkout.
  const flushItem = useCallback(
    (itemId: string): Promise<void> => {
      const prev = inFlightRef.current.get(itemId) ?? Promise.resolve();
      const run = prev.catch(() => {}).then(async () => {
        const quantity = pendingRef.current.get(itemId);
        if (quantity === undefined) return;
        pendingRef.current.delete(itemId);
        try {
          await CartRepository.updateItemQuantity(itemId, quantity);
        } catch (err) {
          setMutationError(err);
          await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
          throw err;
        }
      });
      inFlightRef.current.set(itemId, run);
      void run.catch(() => {}).then(() => {
        if (inFlightRef.current.get(itemId) === run) {
          inFlightRef.current.delete(itemId);
        }
      });
      return run;
    },
    [queryClient],
  );

  const clearTimer = useCallback((itemId: string): void => {
    const timer = timersRef.current.get(itemId);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(itemId);
    }
  }, []);

  const scheduleFlush = useCallback(
    (itemId: string, quantity: number): void => {
      pendingRef.current.set(itemId, quantity);
      clearTimer(itemId);
      const timer = setTimeout(() => {
        timersRef.current.delete(itemId);
        void flushItem(itemId).catch(() => {});
      }, DEBOUNCE_MS);
      timersRef.current.set(itemId, timer);
    },
    [clearTimer, flushItem],
  );

  // Al desmontar, manda los pendientes sin tocar estado (fire-and-forget) para que
  // ningún cambio quede sin persistir si el usuario navega antes del debounce.
  useEffect(() => {
    const timers = timersRef.current;
    const pending = pendingRef.current;
    const inFlight = inFlightRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      pending.forEach((quantity, itemId) => {
        const prev = inFlight.get(itemId) ?? Promise.resolve();
        void prev
          .catch(() => {})
          .then(() => CartRepository.updateItemQuantity(itemId, quantity))
          .catch(() => {});
      });
      pending.clear();
    };
  }, []);

  const error = translateQueryError(query.error ?? mutationError);

  const refresh = async (): Promise<void> => {
    setMutationError(null);
    await query.refetch();
  };

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number): Promise<void> => {
      if (quantity < 1) return; // la eliminación es explícita (botón borrar)
      setMutationError(null);
      setLocalItems((items) =>
        items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
      );
      scheduleFlush(itemId, quantity);
    },
    [setLocalItems, scheduleFlush],
  );

  const removeItem = useCallback(
    async (itemId: string): Promise<void> => {
      setMutationError(null);
      clearTimer(itemId);
      pendingRef.current.delete(itemId);
      setLocalItems((items) => items.filter((item) => item.id !== itemId));
      try {
        await CartRepository.deleteItem(itemId);
      } catch (err) {
        setMutationError(err);
        await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      }
    },
    [clearTimer, setLocalItems, queryClient],
  );

  const flushPending = useCallback(async (): Promise<void> => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    const ids = new Set([
      ...pendingRef.current.keys(),
      ...inFlightRef.current.keys(),
    ]);
    await Promise.all(Array.from(ids).map((id) => flushItem(id)));
  }, [flushItem]);

  return {
    cart: query.data?.cart ?? null,
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    summary: query.data?.summary ?? EMPTY_SUMMARY,
    isLoading: query.isPending,
    isRefreshing: query.isFetching && !query.isPending,
    error,
    refresh,
    updateQuantity,
    removeItem,
    flushPending,
  };
};

export default useCart;
