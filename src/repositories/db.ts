/**
 * Conexión singleton a la DB local SQLite (expo-sqlite) y su esquema.
 *
 * Vive aparte del repositorio de catálogo para separar la infraestructura de
 * conexión del acceso a datos: otros repos (ej. listas) reusan la misma
 * conexión en vez de abrir changuiapp.db por separado.
 */

import * as SQLite from 'expo-sqlite';
import { logger } from '@/utils/debugStore';

const DB_NAME = 'changuiapp.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Métodos de consulta de expo-sqlite que reciben el SQL como primer argumento.
const LOGGED_METHODS = new Set([
  'runAsync',
  'getFirstAsync',
  'getAllAsync',
  'getEachAsync',
  'execAsync',
]);

// Etiqueta corta del SQL para el overlay (una línea, sin sangrías, truncada).
const sqlLabel = (arg: unknown): string => {
  if (typeof arg !== 'string') return '(query)';
  const flat = arg.replace(/\s+/g, ' ').trim();
  return flat.length > 70 ? `${flat.slice(0, 70)}…` : flat;
};

// Envuelve la conexión en un Proxy que registra cada query local (con latencia)
// en el debug overlay como source 'sqlite'. Así toda la I/O a SQLite queda
// visible sin instrumentar cada repositorio.
const instrumentDb = (db: SQLite.SQLiteDatabase): SQLite.SQLiteDatabase =>
  new Proxy(db, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') return value;
      if (!LOGGED_METHODS.has(prop as string)) return value.bind(target);
      return async (...args: unknown[]) => {
        const start = Date.now();
        try {
          const result = await value.apply(target, args);
          logger.call({
            source: 'sqlite',
            message: `${String(prop)} ${sqlLabel(args[0])}`,
            durationMs: Date.now() - start,
          });
          return result;
        } catch (err) {
          logger.call({
            source: 'sqlite',
            level: 'error',
            message: `${String(prop)} ${sqlLabel(args[0])} — ${String(err)}`,
            durationMs: Date.now() - start,
          });
          throw err;
        }
      };
    },
  });

/**
 * Conexión singleton a la DB local. Crea la tabla `products` y el índice
 * full-text `products_fts` (FTS5). Usamos una tabla FTS standalone (no
 * external-content) porque upsertProducts hace INSERT OR REPLACE, que cambia el
 * rowid implícito de `products` en cada re-upsert y desincronizaría un
 * content_rowid. La unión se hace por `barcode`, que sí es estable. El tokenizer
 * ignora acentos: "serenisima" matchea "Serenísima".
 */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS products (
          barcode TEXT PRIMARY KEY NOT NULL,
          id TEXT NOT NULL,
          name TEXT NOT NULL,
          brand TEXT,
          image_url TEXT,
          price REAL NOT NULL,
          tax_category TEXT,
          tax_rate REAL,
          tax_net_price REAL,
          tax_amount REAL,
          updated_at TEXT NOT NULL
        );
        CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
          barcode UNINDEXED,
          name,
          brand,
          tokenize = 'unicode61 remove_diacritics 2'
        );
      `);
      await backfillFtsIfEmpty(db);
      // Se instrumenta después del setup: las queries de creación de tablas y el
      // backfill son infraestructura, no interesan en el overlay.
      return instrumentDb(db);
    });
  }
  return dbPromise;
}

/**
 * Puebla el índice FTS desde `products` cuando está vacío pero ya hay catálogo
 * sincronizado (devices que bajaron el catálogo antes de existir la FTS).
 * Idempotente: en arranques posteriores la FTS ya tiene filas y no hace nada.
 */
async function backfillFtsIfEmpty(db: SQLite.SQLiteDatabase): Promise<void> {
  const fts = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM products_fts`);
  if ((fts?.n ?? 0) > 0) return;
  const prod = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM products`);
  if ((prod?.n ?? 0) === 0) return;
  await db.execAsync(`
    INSERT INTO products_fts (barcode, name, brand)
    SELECT barcode, name, COALESCE(brand, '') FROM products;
  `);
}
