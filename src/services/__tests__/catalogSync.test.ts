import { syncCatalog } from '../catalogSync';
import { apiFetch } from '@/utils/apiFetch';
import * as ProductCatalogRepository from '@/repositories/ProductCatalogRepository';

jest.mock('@/utils/apiFetch', () => ({ apiFetch: jest.fn() }));
jest.mock('@/repositories/ProductCatalogRepository', () => ({
  getSyncedAt: jest.fn(),
  setSyncedAt: jest.fn(),
  upsertProducts: jest.fn(),
}));

const mockedApiFetch = jest.mocked(apiFetch);
const mockedRepo = jest.mocked(ProductCatalogRepository);

const jsonResponse = (body: unknown): Response =>
  ({ json: async () => body }) as unknown as Response;

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
    mockedRepo.setSyncedAt.mockResolvedValue();
  });

  it('primer arranque (sin cursor): baja todo, upsertea y guarda el cursor final', async () => {
    mockedRepo.getSyncedAt.mockResolvedValue(null);
    mockedApiFetch.mockResolvedValueOnce(
      jsonResponse({
        products: [product('111', '2026-06-08T10:00:00.000Z')],
        count: 1,
        has_more: false,
        next_cursor: '2026-06-08T10:00:00.000Z',
      }),
    );

    const result = await syncCatalog();

    expect(result).toEqual({ synced: 1 });
    // sin cursor, no manda updated_since
    expect(mockedApiFetch.mock.calls[0][0]).not.toContain('updated_since');
    expect(mockedRepo.upsertProducts).toHaveBeenCalledTimes(1);
    expect(mockedRepo.setSyncedAt).toHaveBeenCalledWith('2026-06-08T10:00:00.000Z');
  });

  it('pagina mientras has_more y acumula el offset', async () => {
    mockedRepo.getSyncedAt.mockResolvedValue(null);
    mockedApiFetch
      .mockResolvedValueOnce(
        jsonResponse({
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
        jsonResponse({
          products: [product('3', '2026-06-08T10:00:00.000Z')],
          count: 1,
          has_more: false,
          next_cursor: '2026-06-08T10:00:00.000Z',
        }),
      );

    const result = await syncCatalog();

    expect(result).toEqual({ synced: 3 });
    expect(mockedApiFetch).toHaveBeenCalledTimes(2);
    expect(mockedApiFetch.mock.calls[0][0]).toContain('offset=0');
    expect(mockedApiFetch.mock.calls[1][0]).toContain('offset=2');
    expect(mockedRepo.setSyncedAt).toHaveBeenCalledWith('2026-06-08T10:00:00.000Z');
  });

  it('con cursor previo manda updated_since y no reescribe el cursor si no hay cambios', async () => {
    mockedRepo.getSyncedAt.mockResolvedValue('2026-06-07T00:00:00.000Z');
    mockedApiFetch.mockResolvedValueOnce(
      jsonResponse({ products: [], count: 0, has_more: false, next_cursor: null }),
    );

    const result = await syncCatalog();

    expect(result).toEqual({ synced: 0 });
    expect(mockedApiFetch.mock.calls[0][0]).toContain('updated_since=2026-06-07T00%3A00%3A00.000Z');
    expect(mockedRepo.upsertProducts).not.toHaveBeenCalled();
    expect(mockedRepo.setSyncedAt).not.toHaveBeenCalled();
  });
});
