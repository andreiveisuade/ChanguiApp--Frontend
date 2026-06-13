import ListRepository from '../ListRepository';
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
const mockedPost = httpClient.post as jest.Mock;
const mockedPut = httpClient.put as jest.Mock;
const mockedDelete = httpClient.delete as jest.Mock;
const res = <T>(data: T) => ({ data });

describe('ListRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getLists mapea raw->domain y computa el progreso', async () => {
    mockedGet.mockResolvedValueOnce(
      res([
        {
          id: 'l1',
          name: 'Súper',
          items: [
            { id: 'i1', list_id: 'l1', product_name: 'Leche', barcode: null, quantity: 2, purchased: true },
            { id: 'i2', list_id: 'l1', product_name: 'Pan', barcode: null, quantity: 1, purchased: false },
          ],
        },
      ])
    );
    const lists = await ListRepository.getLists();
    expect(mockedGet).toHaveBeenCalledWith('/api/lists');
    expect(lists).toEqual([
      { id: 'l1', name: 'Súper', total_items: 2, done_items: 1, created_at: undefined },
    ]);
  });

  it('getList mapea la lista y los items (product_name -> name)', async () => {
    mockedGet.mockResolvedValueOnce(
      res({
        id: 'l1',
        name: 'Súper',
        items: [
          { id: 'i1', list_id: 'l1', product_name: 'Leche', barcode: null, quantity: 2, purchased: false },
        ],
      })
    );
    const { list, items } = await ListRepository.getList('l1');
    expect(mockedGet).toHaveBeenCalledWith('/api/lists/l1');
    expect(list.total_items).toBe(1);
    expect(items[0]).toEqual({
      id: 'i1',
      list_id: 'l1',
      name: 'Leche',
      quantity: 2,
      purchased: false,
      created_at: undefined,
    });
  });

  it('createList hace POST con name', async () => {
    mockedPost.mockResolvedValueOnce(res({ id: 'l2', name: 'Nueva', items: [] }));
    const r = await ListRepository.createList('Nueva');
    expect(mockedPost).toHaveBeenCalledWith('/api/lists', { name: 'Nueva' });
    expect(r.name).toBe('Nueva');
  });

  it('addItem hace POST con product_name; quantity null -> 1', async () => {
    mockedPost.mockResolvedValueOnce(
      res({ id: 'i9', list_id: 'l1', product_name: 'Huevos', barcode: null, quantity: null, purchased: false })
    );
    const item = await ListRepository.addItem('l1', 'Huevos');
    expect(mockedPost).toHaveBeenCalledWith('/api/lists/l1/items', { product_name: 'Huevos' });
    expect(item.name).toBe('Huevos');
    expect(item.quantity).toBe(1);
  });

  it('setPurchased hace PUT con purchased', async () => {
    mockedPut.mockResolvedValueOnce(
      res({ id: 'i1', list_id: 'l1', product_name: 'Leche', barcode: null, quantity: 1, purchased: true })
    );
    const item = await ListRepository.setPurchased('l1', 'i1', true);
    expect(mockedPut).toHaveBeenCalledWith('/api/lists/l1/items/i1', { purchased: true });
    expect(item.purchased).toBe(true);
  });

  it('deleteList hace DELETE', async () => {
    mockedDelete.mockResolvedValueOnce(res({ deleted: true }));
    await ListRepository.deleteList('l1');
    expect(mockedDelete).toHaveBeenCalledWith('/api/lists/l1');
  });
});
