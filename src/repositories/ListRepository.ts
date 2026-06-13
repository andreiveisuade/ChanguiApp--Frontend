/**
 * Repositorio de listas de compras: persistencia LOCAL en SQLite (expo-sqlite),
 * mismo patrón que ProductCatalogRepository. Las listas se arman y se tachan en
 * el dispositivo (funciona offline); no dependen del backend. La API pública es
 * idéntica a un repo remoto, así los ViewModels no saben de SQLite.
 */
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { ShoppingList, ShoppingListItem } from '@/types/domain';

const DB_NAME = 'changuiapp.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME)
      .then(async (db) => {
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS lists (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS list_items (
            id TEXT PRIMARY KEY NOT NULL,
            list_id TEXT NOT NULL,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            purchased INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
          );
        `);
        return db;
      })
      .catch((e) => {
        dbPromise = null;
        throw e;
      });
  }
  return dbPromise;
}

interface ListRow {
  id: string;
  name: string;
  created_at: string;
}

interface ItemRow {
  id: string;
  list_id: string;
  name: string;
  quantity: number;
  purchased: number;
  created_at: string;
}

function rowToItem(r: ItemRow): ShoppingListItem {
  return {
    id: r.id,
    list_id: r.list_id,
    name: r.name,
    quantity: r.quantity,
    purchased: r.purchased === 1,
    created_at: r.created_at,
  };
}

export const ListRepository = {
  async getLists(): Promise<ShoppingList[]> {
    const db = await getDb();
    const lists = await db.getAllAsync<ListRow>('SELECT * FROM lists ORDER BY created_at DESC');
    const result: ShoppingList[] = [];
    for (const l of lists) {
      const counts = await db.getFirstAsync<{ total: number; done: number }>(
        'SELECT COUNT(*) AS total, COALESCE(SUM(purchased), 0) AS done FROM list_items WHERE list_id = ?',
        l.id
      );
      result.push({
        id: l.id,
        name: l.name,
        total_items: counts?.total ?? 0,
        done_items: counts?.done ?? 0,
        created_at: l.created_at,
      });
    }
    return result;
  },

  async getList(id: string): Promise<{ list: ShoppingList; items: ShoppingListItem[] }> {
    const db = await getDb();
    const row = await db.getFirstAsync<ListRow>('SELECT * FROM lists WHERE id = ?', id);
    const itemRows = await db.getAllAsync<ItemRow>(
      'SELECT * FROM list_items WHERE list_id = ? ORDER BY created_at ASC',
      id
    );
    const items = itemRows.map(rowToItem);
    return {
      list: {
        id: row?.id ?? id,
        name: row?.name ?? '',
        total_items: items.length,
        done_items: items.filter((i) => i.purchased).length,
        created_at: row?.created_at,
      },
      items,
    };
  },

  async createList(name: string): Promise<ShoppingList> {
    const db = await getDb();
    const id = Crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await db.runAsync('INSERT INTO lists (id, name, created_at) VALUES (?, ?, ?)', id, name, createdAt);
    return { id, name, total_items: 0, done_items: 0, created_at: createdAt };
  },

  async deleteList(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM list_items WHERE list_id = ?', id);
    await db.runAsync('DELETE FROM lists WHERE id = ?', id);
  },

  async addItem(listId: string, name: string): Promise<ShoppingListItem> {
    const db = await getDb();
    const id = Crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO list_items (id, list_id, name, quantity, purchased, created_at) VALUES (?, ?, ?, 1, 0, ?)',
      id,
      listId,
      name,
      createdAt
    );
    return { id, list_id: listId, name, quantity: 1, purchased: false, created_at: createdAt };
  },

  async setPurchased(listId: string, itemId: string, purchased: boolean): Promise<ShoppingListItem> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE list_items SET purchased = ? WHERE id = ? AND list_id = ?',
      purchased ? 1 : 0,
      itemId,
      listId
    );
    const row = await db.getFirstAsync<ItemRow>('SELECT * FROM list_items WHERE id = ?', itemId);
    return row
      ? rowToItem(row)
      : { id: itemId, list_id: listId, name: '', quantity: 1, purchased };
  },
};

export default ListRepository;
