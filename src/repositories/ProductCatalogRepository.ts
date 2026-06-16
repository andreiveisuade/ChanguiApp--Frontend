/**
 * Acceso al cache local del catálogo de productos en SQLite (expo-sqlite).
 *
 * El escaneo y el buscador resuelven contra esta DB local en vez de pegarle a
 * Supabase. La conexión y el esquema viven en repositories/db; el cursor del
 * último sync, en repositories/catalogSyncCursor. La sincronización incremental
 * la orquesta services/catalogSync.
 */

import { Product } from '@/types/domain';
import { getDb } from '@/repositories/db';

/** Producto tal como lo devuelve GET /api/products (Product + updated_at). */
export type CatalogApiItem = Product & { updated_at: string };

interface ProductRow {
  barcode: string;
  id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  price: number;
  tax_category: string | null;
  tax_rate: number | null;
  tax_net_price: number | null;
  tax_amount: number | null;
  updated_at: string;
}

function rowToProduct(row: ProductRow): Product {
  const product: Product = {
    id: row.id,
    name: row.name,
    barcode: row.barcode,
    brand: row.brand,
    image_url: row.image_url,
    price: row.price,
  };
  if (row.tax_rate !== null) {
    product.tax = {
      category: row.tax_category ?? 'General',
      rate: row.tax_rate,
      net_price: row.tax_net_price ?? 0,
      tax_amount: row.tax_amount ?? 0,
    };
  }
  return product;
}

/** Inserta o reemplaza un lote de productos del catálogo en una transacción. */
export async function upsertProducts(items: CatalogApiItem[]): Promise<void> {
  if (items.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const p of items) {
      await db.runAsync(
        `INSERT OR REPLACE INTO products
           (barcode, id, name, brand, image_url, price, tax_category, tax_rate, tax_net_price, tax_amount, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.barcode,
          p.id,
          p.name,
          p.brand ?? null,
          p.image_url ?? null,
          p.price,
          p.tax?.category ?? null,
          p.tax?.rate ?? null,
          p.tax?.net_price ?? null,
          p.tax?.tax_amount ?? null,
          p.updated_at,
        ],
      );
      // Mantener el índice FTS en sync por barcode (DELETE+INSERT evita depender
      // del rowid, que el INSERT OR REPLACE de arriba reescribe).
      await db.runAsync(`DELETE FROM products_fts WHERE barcode = ?`, [p.barcode]);
      await db.runAsync(`INSERT INTO products_fts (barcode, name, brand) VALUES (?, ?, ?)`, [
        p.barcode,
        p.name,
        p.brand ?? '',
      ]);
    }
  });
}

/** Busca un producto por barcode en el cache local. null si no está. */
export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ProductRow>(`SELECT * FROM products WHERE barcode = ?`, [
    barcode,
  ]);
  return row ? rowToProduct(row) : null;
}

/**
 * Convierte el texto del usuario en una MATCH query de FTS5 segura para
 * autocompletado: descarta toda la sintaxis especial de FTS5 (queda solo
 * letras/números/espacios, así no hay forma de inyectar operadores), tokeniza y
 * agrega prefijo a cada token. "Sere lec" -> "sere* lec*" (AND implícito).
 * Devuelve null si no queda ningún token.
 */
function toFtsMatchQuery(raw: string): string | null {
  const tokens = raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return null;
  return tokens.map((token) => `${token}*`).join(' ');
}

/**
 * Busca productos por nombre/marca en el cache local (FTS5). Resuelve 100%
 * contra SQLite, nunca pega a la red. Ordena por relevancia (bm25, con más peso
 * al nombre que a la marca). Devuelve [] si la query queda vacía o ante error
 * (el buscador no debe romper la UI).
 */
export async function searchProducts(query: string, limit: number): Promise<Product[]> {
  const match = toFtsMatchQuery(query);
  if (!match) return [];
  const db = await getDb();
  try {
    const rows = await db.getAllAsync<ProductRow>(
      `SELECT p.* FROM products_fts f
         JOIN products p ON p.barcode = f.barcode
        WHERE products_fts MATCH ?
        ORDER BY bm25(products_fts, 1.0, 10.0, 5.0)
        LIMIT ?`,
      [match, limit],
    );
    return rows.map(rowToProduct);
  } catch {
    return [];
  }
}

/** Cantidad de productos cacheados (0 = primer arranque, falta descarga inicial). */
export async function countProducts(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM products`);
  return row?.n ?? 0;
}
