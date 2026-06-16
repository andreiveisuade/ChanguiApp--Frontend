/**
 * Cursor del último sync incremental del catálogo (updated_at máximo),
 * persistido en AsyncStorage. Separado del repositorio de catálogo (SQLite):
 * es estado de sincronización, no acceso al catálogo de productos.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';

/** Cursor del último sync (updated_at máximo sincronizado). null si nunca se sincronizó. */
export async function getSyncedAt(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.catalogSyncedAt);
}

export async function setSyncedAt(cursor: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.catalogSyncedAt, cursor);
}
