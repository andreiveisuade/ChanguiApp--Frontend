/**
 * Sync incremental del catálogo hacia el cache local de SQLite.
 *
 * Al abrir la app (post-login) se trae solo el delta: pide a GET /api/products
 * los productos con updated_at mayor al último cursor guardado, paginando hasta
 * agotar. El primer arranque (sin cursor) baja el catálogo completo.
 */

import httpClient from '@/config/clients';
import * as ProductCatalogRepository from '@/repositories/ProductCatalogRepository';
import type { CatalogApiItem } from '@/repositories/ProductCatalogRepository';

const PAGE_LIMIT = 500;

interface CatalogPage {
  products: CatalogApiItem[];
  count: number;
  has_more: boolean;
  next_cursor: string | null;
}

/**
 * Sincroniza el catálogo local con el backend. Idempotente y barato cuando no
 * hay cambios (el endpoint devuelve 0 filas). Devuelve cuántos productos se
 * upsertearon en esta corrida.
 */
export async function syncCatalog(): Promise<{ synced: number }> {
  const since = await ProductCatalogRepository.getSyncedAt();
  let offset = 0;
  let synced = 0;
  let maxCursor = since;

  for (;;) {
    const params: Record<string, string | number> = {
      limit: PAGE_LIMIT,
      offset,
    };
    if (since) params.updated_since = since;

    const { data: page } = await httpClient.get<CatalogPage>('/api/products', { params });

    if (page.products.length > 0) {
      await ProductCatalogRepository.upsertProducts(page.products);
      synced += page.products.length;
    }

    if (page.next_cursor && (!maxCursor || page.next_cursor > maxCursor)) {
      maxCursor = page.next_cursor;
    }

    offset += page.count;
    if (!page.has_more) break;
  }

  if (maxCursor && maxCursor !== since) {
    await ProductCatalogRepository.setSyncedAt(maxCursor);
  }

  return { synced };
}
