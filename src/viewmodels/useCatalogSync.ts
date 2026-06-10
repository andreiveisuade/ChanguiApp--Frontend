import { useEffect } from 'react';
import { syncCatalog } from '@/services/catalogSync';

/**
 * Dispara el sync incremental del catálogo en background cuando `enabled` pasa
 * a true (tras autenticarse). Fire-and-forget: un fallo de red no rompe la UI,
 * el escaneo cae al backend mientras tanto.
 */
export function useCatalogSync(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    syncCatalog().catch((err) => {
      if (!cancelled) {
        console.warn('[catalog] sync falló:', err);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);
}
