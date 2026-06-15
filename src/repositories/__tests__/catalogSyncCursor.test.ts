jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn() },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSyncedAt, setSyncedAt } from '../catalogSyncCursor';

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('catalogSyncCursor', () => {
  afterEach(() => jest.clearAllMocks());

  it('getSyncedAt lee el cursor de AsyncStorage', async () => {
    mockedAsyncStorage.getItem.mockResolvedValueOnce('2026-06-08T10:00:00.000Z');
    expect(await getSyncedAt()).toBe('2026-06-08T10:00:00.000Z');
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith('@changuiapp/catalog_synced_at');
  });

  it('setSyncedAt escribe el cursor en AsyncStorage', async () => {
    await setSyncedAt('2026-06-08T10:00:00.000Z');
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      '@changuiapp/catalog_synced_at',
      '2026-06-08T10:00:00.000Z',
    );
  });
});
