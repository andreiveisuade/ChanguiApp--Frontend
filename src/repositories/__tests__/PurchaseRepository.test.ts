import PurchaseRepository from '../PurchaseRepository';
import httpClient from '@/config/clients';

jest.mock('@/config/clients', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedGet = httpClient.get as jest.Mock;
const axiosResponse = <T>(data: T) => ({ data });

describe('PurchaseRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPurchases', () => {
    it('mapea created_at→date, payment_status→status y normaliza store_name null', async () => {
      mockedGet.mockResolvedValueOnce(
        axiosResponse([
          { id: 'pu1', total: 1500, payment_status: 'completed', created_at: '2026-06-09T10:00:00Z', store_name: 'Coto' },
          { id: 'pu2', total: 800, payment_status: 'failed', created_at: '2026-06-08T10:00:00Z' },
        ]),
      );

      const result = await PurchaseRepository.getPurchases();

      expect(mockedGet).toHaveBeenCalledWith('/api/purchases', { params: undefined });
      expect(result).toEqual([
        { id: 'pu1', store_name: 'Coto', date: '2026-06-09T10:00:00Z', total: 1500, status: 'completed' },
        { id: 'pu2', store_name: null, date: '2026-06-08T10:00:00Z', total: 800, status: 'failed' },
      ]);
    });

    it('cuando se pasa status lo manda como query param', async () => {
      mockedGet.mockResolvedValueOnce(axiosResponse([]));

      await PurchaseRepository.getPurchases('completed');

      expect(mockedGet).toHaveBeenCalledWith('/api/purchases', { params: { status: 'completed' } });
    });

    it('devuelve [] cuando el backend manda null', async () => {
      mockedGet.mockResolvedValueOnce(axiosResponse(null));

      const result = await PurchaseRepository.getPurchases();

      expect(result).toEqual([]);
    });
  });

  describe('getPurchaseById', () => {
    it('mapea el detalle con items, item_count y summary', async () => {
      mockedGet.mockResolvedValueOnce(
        axiosResponse({
          id: 'pu1',
          total: 1500,
          payment_status: 'completed',
          created_at: '2026-06-09T10:00:00Z',
          store_name: 'Coto',
          items: [
            { id: 'it1', purchase_id: 'pu1', product_name: 'Yerba', barcode: '779', quantity: 2, unit_price: 500 },
          ],
          summary: { subtotal_net: 909, taxes: [], total: 1000 },
        }),
      );

      const result = await PurchaseRepository.getPurchaseById('pu1');

      expect(mockedGet).toHaveBeenCalledWith('/api/purchases/pu1');
      expect(result.item_count).toBe(1);
      expect(result.items[0].product_name).toBe('Yerba');
      expect(result.status).toBe('completed');
      expect(result.summary?.total).toBe(1000);
    });

    it('detalle sin items mapea a lista vacía y item_count 0', async () => {
      mockedGet.mockResolvedValueOnce(
        axiosResponse({ id: 'pu1', total: 0, payment_status: 'pending', created_at: '2026-06-09T10:00:00Z' }),
      );

      const result = await PurchaseRepository.getPurchaseById('pu1');

      expect(result.items).toEqual([]);
      expect(result.item_count).toBe(0);
    });

    it('propaga el error del httpClient (un 404 de ownership no se silencia)', async () => {
      mockedGet.mockRejectedValueOnce(new Error('Request failed with status 404'));

      await expect(PurchaseRepository.getPurchaseById('ajena')).rejects.toThrow('status 404');
    });
  });
});
