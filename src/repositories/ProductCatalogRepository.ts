/**
 * Cache local del catálogo de productos en SQLite (expo-sqlite).
 *
 * El escaneo resuelve por barcode contra esta DB local en vez de pegarle a
 * Supabase en cada scan. Se sincroniza de forma incremental al abrir la app
 * (ver services/catalogSync). El cursor del último sync se guarda en
 * AsyncStorage (STORAGE_KEYS.catalogSyncedAt).
 */

import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';
import { Product } from '@/types/domain';

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

const DB_NAME = 'changuiapp.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
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
      `);
      return db;
    });
  }
  return dbPromise;
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
    }
  });
}

/** Busca un producto por barcode en el cache local. null si no está. */
export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ProductRow>(
    `SELECT * FROM products WHERE barcode = ?`,
    [barcode],
  );
  return row ? rowToProduct(row) : null;
}

/** Cantidad de productos cacheados (0 = primer arranque, falta descarga inicial). */
export async function countProducts(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM products`);
  return row?.n ?? 0;
}

/** Cursor del último sync (updated_at máximo sincronizado). null si nunca se sincronizó. */
export async function getSyncedAt(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.catalogSyncedAt);
}

export async function setSyncedAt(cursor: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.catalogSyncedAt, cursor);
}
