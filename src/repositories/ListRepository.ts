/**
 * Persistencia local de las listas de compra en SQLite (expo-sqlite).
 *
 * Reusa la conexión de ProductCatalogRepository (misma DB changuiapp.db) en vez
 * de abrir una segunda. Las listas y sus ítems viven 100% on-device: ninguna
 * operación pega a la red. Cada ítem guarda un snapshot del producto del
 * catálogo (barcode + name/brand/price/image_url) al momento de agregarlo.
 */

import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { getDb } from '@/repositories/ProductCatalogRepository';
import { Product, ShoppingList, ShoppingListItem } from '@/types/domain';

interface ListRow {
  id: string;
  name: string;
  created_at: string;
  total_items: number;
  done_items: number;
}

interface ItemRow {
  id: string;
  list_id: string;
  barcode: string;
  name: string;
  brand: string | null;
  price: number;
  image_url: string | null;
  quantity: number;
  purchased: number;
  created_at: string;
}

let tablesPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Conexión compartida con las tablas de listas garantizadas (idempotente). */
async function getListDb(): Promise<SQLite.SQLiteDatabase> {
  if (!tablesPromise) {
    tablesPromise = getDb().then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS shopping_lists (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS shopping_list_items (
          id TEXT PRIMARY KEY NOT NULL,
          list_id TEXT NOT NULL,
          barcode TEXT NOT NULL,
          name TEXT NOT NULL,
          brand TEXT,
          price REAL NOT NULL,
          image_url TEXT,
          quantity INTEGER NOT NULL DEFAULT 1,
          purchased INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          FOREIGN KEY (list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_list_items_list ON shopping_list_items(list_id);
      `);
      return db;
    });
  }
  return tablesPromise;
}

function rowToItem(row: ItemRow): ShoppingListItem {
  return {
    id: row.id,
    list_id: row.list_id,
    barcode: row.barcode,
    name: row.name,
    brand: row.brand,
    price: row.price,
    image_url: row.image_url,
    quantity: row.quantity,
    purchased: row.purchased === 1,
    created_at: row.created_at,
  };
}

/** Listas con su progreso (total de ítems y cuántos comprados), más reciente primero. */
export async function getLists(): Promise<ShoppingList[]> {
  const db = await getListDb();
  const rows = await db.getAllAsync<ListRow>(`
    SELECT l.id, l.name, l.created_at,
           COUNT(i.id) AS total_items,
           COALESCE(SUM(i.purchased), 0) AS done_items
      FROM shopping_lists l
      LEFT JOIN shopping_list_items i ON i.list_id = l.id
     GROUP BY l.id
     ORDER BY l.created_at DESC
  `);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    total_items: row.total_items,
    done_items: row.done_items,
    created_at: row.created_at,
  }));
}

export async function createList(name: string): Promise<ShoppingList> {
  const db = await getListDb();
  const id = Crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO shopping_lists (id, name, created_at) VALUES (?, ?, ?)`,
    [id, name, createdAt],
  );
  return { id, name, total_items: 0, done_items: 0, created_at: createdAt };
}

export async function deleteList(listId: string): Promise<void> {
  const db = await getListDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync(`DELETE FROM shopping_list_items WHERE list_id = ?`, [listId]);
    await db.runAsync(`DELETE FROM shopping_lists WHERE id = ?`, [listId]);
  });
}

export async function getListItems(listId: string): Promise<ShoppingListItem[]> {
  const db = await getListDb();
  const rows = await db.getAllAsync<ItemRow>(
    `SELECT * FROM shopping_list_items WHERE list_id = ? ORDER BY created_at ASC`,
    [listId],
  );
  return rows.map(rowToItem);
}

/**
 * Agrega un producto del catálogo a la lista. Si el producto ya está en la
 * lista, suma la cantidad en vez de duplicar la fila.
 */
export async function addItem(
  listId: string,
  product: Product,
  quantity = 1,
): Promise<void> {
  const db = await getListDb();
  const existing = await db.getFirstAsync<{ id: string; quantity: number }>(
    `SELECT id, quantity FROM shopping_list_items WHERE list_id = ? AND barcode = ?`,
    [listId, product.barcode],
  );
  if (existing) {
    await db.runAsync(
      `UPDATE shopping_list_items SET quantity = ? WHERE id = ?`,
      [existing.quantity + quantity, existing.id],
    );
    return;
  }
  await db.runAsync(
    `INSERT INTO shopping_list_items
       (id, list_id, barcode, name, brand, price, image_url, quantity, purchased, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [
      Crypto.randomUUID(),
      listId,
      product.barcode,
      product.name,
      product.brand ?? null,
      product.price,
      product.image_url ?? null,
      quantity,
      new Date().toISOString(),
    ],
  );
}

/** Fija la cantidad de un ítem. Cantidad <= 0 lo elimina de la lista. */
export async function setItemQuantity(itemId: string, quantity: number): Promise<void> {
  const db = await getListDb();
  if (quantity <= 0) {
    await db.runAsync(`DELETE FROM shopping_list_items WHERE id = ?`, [itemId]);
    return;
  }
  await db.runAsync(
    `UPDATE shopping_list_items SET quantity = ? WHERE id = ?`,
    [quantity, itemId],
  );
}

export async function toggleItem(itemId: string): Promise<void> {
  const db = await getListDb();
  await db.runAsync(
    `UPDATE shopping_list_items
        SET purchased = CASE purchased WHEN 1 THEN 0 ELSE 1 END
      WHERE id = ?`,
    [itemId],
  );
}

export async function deleteItem(itemId: string): Promise<void> {
  const db = await getListDb();
  await db.runAsync(`DELETE FROM shopping_list_items WHERE id = ?`, [itemId]);
}
