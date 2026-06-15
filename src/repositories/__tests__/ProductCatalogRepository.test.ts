jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn() },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { __mockDb: mockDb } = require('expo-sqlite');
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as repo from '../ProductCatalogRepository';
import type { CatalogApiItem } from '../ProductCatalogRepository';

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const apiItem = (overrides: Partial<CatalogApiItem> = {}): CatalogApiItem => ({
  id: 'p1',
  barcode: '779',
  name: 'Yerba',
  brand: 'Playadito',
  image_url: null,
  price: 1210,
  updated_at: '2026-06-08T10:00:00.000Z',
  tax: { category: 'General', rate: 21, net_price: 1000, tax_amount: 210 },
  ...overrides,
});

describe('ProductCatalogRepository', () => {
  afterEach(() => jest.clearAllMocks());

  describe('upsertProducts', () => {
    it('no abre transacción si el lote está vacío', async () => {
      await repo.upsertProducts([]);
      expect(mockDb.withTransactionAsync).not.toHaveBeenCalled();
    });

    it('inserta cada producto con sus campos de IVA en una transacción', async () => {
      await repo.upsertProducts([apiItem()]);

      expect(mockDb.withTransactionAsync).toHaveBeenCalledTimes(1);
      const params = mockDb.runAsync.mock.calls[0][1];
      expect(params).toEqual([
        '779',
        'p1',
        'Yerba',
        'Playadito',
        null,
        1210,
        'General',
        21,
        1000,
        210,
        '2026-06-08T10:00:00.000Z',
      ]);
    });

    it('guarda nulls cuando el producto no trae tax ni brand', async () => {
      await repo.upsertProducts([apiItem({ brand: null, tax: undefined })]);

      const params = mockDb.runAsync.mock.calls[0][1];
      expect(params.slice(6, 10)).toEqual([null, null, null, null]);
    });
  });

  describe('getProductByBarcode', () => {
    it('reconstruye el Product con su desglose de IVA', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({
        barcode: '779',
        id: 'p1',
        name: 'Yerba',
        brand: 'Playadito',
        image_url: null,
        price: 1210,
        tax_category: 'General',
        tax_rate: 21,
        tax_net_price: 1000,
        tax_amount: 210,
        updated_at: '2026-06-08T10:00:00.000Z',
      });

      const result = await repo.getProductByBarcode('779');

      expect(result).toEqual({
        id: 'p1',
        name: 'Yerba',
        barcode: '779',
        brand: 'Playadito',
        image_url: null,
        price: 1210,
        tax: { category: 'General', rate: 21, net_price: 1000, tax_amount: 210 },
      });
    });

    it('devuelve el producto sin tax cuando tax_rate es null', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({
        barcode: '779',
        id: 'p1',
        name: 'Yerba',
        brand: null,
        image_url: null,
        price: 1210,
        tax_category: null,
        tax_rate: null,
        tax_net_price: null,
        tax_amount: null,
        updated_at: '2026-06-08T10:00:00.000Z',
      });

      const result = await repo.getProductByBarcode('779');

      expect(result?.tax).toBeUndefined();
      expect(result?.price).toBe(1210);
    });

    it('devuelve null si el barcode no está en el cache', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);
      expect(await repo.getProductByBarcode('000')).toBeNull();
    });
  });

  describe('countProducts', () => {
    it('devuelve el conteo', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({ n: 8500 });
      expect(await repo.countProducts()).toBe(8500);
    });

    it('devuelve 0 si no hay fila', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);
      expect(await repo.countProducts()).toBe(0);
    });
  });

  describe('cursor de sync', () => {
    it('getSyncedAt lee de AsyncStorage', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce('2026-06-08T10:00:00.000Z');
      expect(await repo.getSyncedAt()).toBe('2026-06-08T10:00:00.000Z');
      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith('@changuiapp/catalog_synced_at');
    });

    it('setSyncedAt escribe en AsyncStorage', async () => {
      await repo.setSyncedAt('2026-06-08T10:00:00.000Z');
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        '@changuiapp/catalog_synced_at',
        '2026-06-08T10:00:00.000Z',
      );
    });
  });

  describe('searchProducts', () => {
    const productRow = {
      barcode: '779',
      id: 'p1',
      name: 'Leche Serenísima',
      brand: 'La Serenísima',
      image_url: null,
      price: 1500,
      tax_category: 'Leche fluida',
      tax_rate: 0,
      tax_net_price: 1500,
      tax_amount: 0,
      updated_at: '2026-06-08T10:00:00.000Z',
    };

    it('devuelve [] sin tocar la DB cuando la query queda vacía tras sanitizar', async () => {
      expect(await repo.searchProducts('   @#$  ', 10)).toEqual([]);
      expect(mockDb.getAllAsync).not.toHaveBeenCalled();
    });

    it('construye una prefix-query FTS por token y mapea las filas', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([productRow]);

      const result = await repo.searchProducts('Sere lec', 5);

      const [sql, params] = mockDb.getAllAsync.mock.calls[0];
      expect(sql).toContain('products_fts MATCH ?');
      expect(params).toEqual(['sere* lec*', 5]);
      expect(result).toEqual([
        {
          id: 'p1',
          name: 'Leche Serenísima',
          barcode: '779',
          brand: 'La Serenísima',
          image_url: null,
          price: 1500,
          tax: { category: 'Leche fluida', rate: 0, net_price: 1500, tax_amount: 0 },
        },
      ]);
    });

    it('devuelve [] ante un error de la DB (no rompe la UI)', async () => {
      mockDb.getAllAsync.mockRejectedValueOnce(new Error('db fail'));
      expect(await repo.searchProducts('leche', 5)).toEqual([]);
    });
  });
});
