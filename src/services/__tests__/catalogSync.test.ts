import { syncCatalog } from '../catalogSync';
import httpClient from '@/config/clients';
import * as ProductCatalogRepository from '@/repositories/ProductCatalogRepository';
import * as CatalogSyncCursor from '@/repositories/catalogSyncCursor';

jest.mock('@/config/clients', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('@/repositories/ProductCatalogRepository', () => ({
  upsertProducts: jest.fn(),
}));
jest.mock('@/repositories/catalogSyncCursor', () => ({
  getSyncedAt: jest.fn(),
  setSyncedAt: jest.fn(),
}));

const mockedGet = httpClient.get as jest.Mock;
const mockedRepo = jest.mocked(ProductCatalogRepository);
const mockedCursor = jest.mocked(CatalogSyncCursor);
const axiosResponse = <T>(data: T) => ({ data });

const product = (barcode: string, updated_at: string) => ({
  id: `id-${barcode}`,
  barcode,
  name: 'P',
  brand: null,
  image_url: null,
  price: 100,
  updated_at,
  tax: { category: 'General', rate: 21, net_price: 82.64, tax_amount: 17.36 },
});

describe('catalogSync.syncCatalog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRepo.upsertProducts.mockResolvedValue();
    mockedCursor.setSyncedAt.mockResolvedValue();
  });

  it('primer arranque (sin cursor): baja todo, upsertea y guarda el cursor final', async () => {
    mockedCursor.getSyncedAt.mockResolvedValue(null);
    mockedGet.mockResolvedValueOnce(
      axiosResponse({
        products: [product('111', '2026-06-08T10:00:00.000Z')],
        count: 1,
        has_more: false,
        next_cursor: '2026-06-08T10:00:00.000Z',
      }),
    );

    const result = await syncCatalog();

    expect(result).toEqual({ synced: 1 });
    // sin cursor, no manda updated_since
    expect(mockedGet).toHaveBeenCalledWith('/api/products', {
      params: { limit: 500, offset: 0 },
    });
    expect(mockedRepo.upsertProducts).toHaveBeenCalledTimes(1);
    expect(mockedCursor.setSyncedAt).toHaveBeenCalledWith('2026-06-08T10:00:00.000Z');
  });

  it('pagina mientras has_more y acumula el offset', async () => {
    mockedCursor.getSyncedAt.mockResolvedValue(null);
    mockedGet
      .mockResolvedValueOnce(
        axiosResponse({
          products: [
            product('1', '2026-06-08T09:00:00.000Z'),
            product('2', '2026-06-08T09:30:00.000Z'),
          ],
          count: 2,
          has_more: true,
          next_cursor: '2026-06-08T09:30:00.000Z',
        }),
      )
      .mockResolvedValueOnce(
        axiosResponse({
          products: [product('3', '2026-06-08T10:00:00.000Z')],
          count: 1,
          has_more: false,
          next_cursor: '2026-06-08T10:00:00.000Z',
        }),
      );

    const result = await syncCatalog();

    expect(result).toEqual({ synced: 3 });
    expect(mockedGet).toHaveBeenCalledTimes(2);
    expect(mockedGet.mock.calls[0][1].params.offset).toBe(0);
    expect(mockedGet.mock.calls[1][1].params.offset).toBe(2);
    expect(mockedCursor.setSyncedAt).toHaveBeenCalledWith('2026-06-08T10:00:00.000Z');
  });

  it('con cursor previo manda updated_since y no reescribe el cursor si no hay cambios', async () => {
    mockedCursor.getSyncedAt.mockResolvedValue('2026-06-07T00:00:00.000Z');
    mockedGet.mockResolvedValueOnce(
      axiosResponse({ products: [], count: 0, has_more: false, next_cursor: null }),
    );

    const result = await syncCatalog();

    expect(result).toEqual({ synced: 0 });
    expect(mockedGet).toHaveBeenCalledWith('/api/products', {
      params: { limit: 500, offset: 0, updated_since: '2026-06-07T00:00:00.000Z' },
    });
    expect(mockedRepo.upsertProducts).not.toHaveBeenCalled();
    expect(mockedCursor.setSyncedAt).not.toHaveBeenCalled();
  });
});
