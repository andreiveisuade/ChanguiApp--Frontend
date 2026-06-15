jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn() },
}));
jest.mock('expo-crypto', () => ({ randomUUID: jest.fn(() => 'uuid-1') }));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { __mockDb: mockDb } = require('expo-sqlite');
import * as repo from '../ListRepository';
import { Product } from '@/types/domain';

const product: Product = {
  id: 'p1',
  name: 'Leche',
  barcode: '779',
  brand: 'La Serenísima',
  image_url: null,
  price: 1500,
};

const findCall = (needle: string): unknown[] | undefined =>
  mockDb.runAsync.mock.calls.find((c: unknown[]) => String(c[0]).includes(needle));

describe('ListRepository', () => {
  beforeAll(async () => {
    // Fuerza la init de la DB (crear tablas + backfill) antes de los tests, así
    // el backfill no consume los mocks por-test de getFirstAsync.
    mockDb.getFirstAsync.mockResolvedValue(undefined);
    await repo.getLists();
    mockDb.getFirstAsync.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockDb.getAllAsync.mockResolvedValue([]);
  });

  it('getLists mapea filas con su progreso', async () => {
    mockDb.getAllAsync.mockResolvedValueOnce([
      {
        id: 'l1',
        name: 'Súper',
        created_at: '2026-06-10T00:00:00.000Z',
        total_items: 3,
        done_items: 1,
      },
    ]);
    const lists = await repo.getLists();
    expect(lists).toEqual([
      {
        id: 'l1',
        name: 'Súper',
        total_items: 3,
        done_items: 1,
        created_at: '2026-06-10T00:00:00.000Z',
      },
    ]);
  });

  it('createList inserta y devuelve la lista nueva', async () => {
    const list = await repo.createList('Súper');
    expect(list).toEqual({
      id: 'uuid-1',
      name: 'Súper',
      total_items: 0,
      done_items: 0,
      created_at: expect.any(String),
    });
    const insert = findCall('INSERT INTO shopping_lists');
    expect(insert?.[1]).toEqual(['uuid-1', 'Súper', expect.any(String)]);
  });

  it('addItem inserta cuando el producto no está en la lista', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce(null);
    await repo.addItem('list-1', product, 2);
    const insert = findCall('INSERT INTO shopping_list_items') as unknown[];
    const params = insert[1] as unknown[];
    expect(params[1]).toBe('list-1'); // list_id
    expect(params[2]).toBe('779'); // barcode
    expect(params[3]).toBe('Leche'); // name
    expect(params[5]).toBe(1500); // price
    expect(params[7]).toBe(2); // quantity
  });

  it('addItem suma cantidad cuando el producto ya está', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce({ id: 'item-1', quantity: 2 });
    await repo.addItem('list-1', product, 1);
    const update = findCall('UPDATE shopping_list_items SET quantity');
    expect(update?.[1]).toEqual([3, 'item-1']);
    expect(findCall('INSERT INTO shopping_list_items')).toBeUndefined();
  });

  it('toggleItem alterna el flag purchased', async () => {
    await repo.toggleItem('item-1');
    const toggle = findCall('CASE purchased');
    expect(toggle?.[1]).toEqual(['item-1']);
  });

  it('setItemQuantity elimina el ítem cuando la cantidad es 0', async () => {
    await repo.setItemQuantity('item-1', 0);
    expect(findCall('DELETE FROM shopping_list_items')?.[1]).toEqual(['item-1']);
    expect(findCall('UPDATE shopping_list_items SET quantity')).toBeUndefined();
  });

  it('deleteList borra ítems y lista en una transacción', async () => {
    await repo.deleteList('list-1');
    expect(mockDb.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(findCall('DELETE FROM shopping_list_items WHERE list_id')?.[1]).toEqual(['list-1']);
    expect(findCall('DELETE FROM shopping_lists WHERE id')?.[1]).toEqual(['list-1']);
  });

  it('getListItems mapea las filas y normaliza purchased a boolean', async () => {
    mockDb.getAllAsync.mockResolvedValueOnce([
      {
        id: 'i1',
        list_id: 'l1',
        barcode: '779',
        name: 'Leche',
        brand: 'La Serenísima',
        price: 1500,
        image_url: null,
        quantity: 2,
        purchased: 1,
        created_at: '2026-06-10T00:00:00.000Z',
      },
      {
        id: 'i2',
        list_id: 'l1',
        barcode: '780',
        name: 'Pan',
        brand: null,
        price: 800,
        image_url: null,
        quantity: 1,
        purchased: 0,
        created_at: '2026-06-10T00:01:00.000Z',
      },
    ]);
    const items = await repo.getListItems('l1');
    expect(mockDb.getAllAsync.mock.calls[0][1]).toEqual(['l1']);
    expect(items[0]).toEqual({
      id: 'i1',
      list_id: 'l1',
      barcode: '779',
      name: 'Leche',
      brand: 'La Serenísima',
      price: 1500,
      image_url: null,
      quantity: 2,
      purchased: true,
      created_at: '2026-06-10T00:00:00.000Z',
    });
    expect(items[1].purchased).toBe(false);
  });

  it('setItemQuantity actualiza la cantidad cuando es mayor a 0', async () => {
    await repo.setItemQuantity('item-1', 5);
    expect(findCall('UPDATE shopping_list_items SET quantity')?.[1]).toEqual([5, 'item-1']);
    expect(findCall('DELETE FROM shopping_list_items')).toBeUndefined();
  });

  it('deleteItem borra solo el ítem indicado', async () => {
    await repo.deleteItem('item-1');
    expect(findCall('DELETE FROM shopping_list_items WHERE id')?.[1]).toEqual(['item-1']);
  });

  it('addItem guarda null en brand y conserva el image_url al insertar', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce(null);
    await repo.addItem('list-1', { ...product, brand: null, image_url: 'https://img/leche.png' });
    const insert = findCall('INSERT INTO shopping_list_items') as unknown[];
    const params = insert[1] as unknown[];
    expect(params[4]).toBeNull(); // brand
    expect(params[6]).toBe('https://img/leche.png'); // image_url
  });

  describe('propaga los errores de la DB (los traduce el viewmodel)', () => {
    it('getLists rechaza si getAllAsync falla', async () => {
      mockDb.getAllAsync.mockRejectedValueOnce(new Error('db fail'));
      await expect(repo.getLists()).rejects.toThrow('db fail');
    });

    it('createList rechaza si el insert falla', async () => {
      mockDb.runAsync.mockRejectedValueOnce(new Error('insert fail'));
      await expect(repo.createList('Súper')).rejects.toThrow('insert fail');
    });

    it('addItem rechaza si la consulta previa falla', async () => {
      mockDb.getFirstAsync.mockRejectedValueOnce(new Error('select fail'));
      await expect(repo.addItem('list-1', product)).rejects.toThrow('select fail');
    });

    it('deleteList rechaza si la transacción falla', async () => {
      mockDb.withTransactionAsync.mockRejectedValueOnce(new Error('tx fail'));
      await expect(repo.deleteList('list-1')).rejects.toThrow('tx fail');
    });
  });
});
