import ListRepository from '../ListRepository';
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'uuid-fixed'),
}));

 
const { __mockDb: mockDb } = require('expo-sqlite');

describe('ListRepository (SQLite local)', () => {
  afterEach(() => jest.clearAllMocks());

  it('getLists devuelve las listas con su progreso (total/done)', async () => {
    mockDb.getAllAsync.mockResolvedValueOnce([
      { id: 'l1', name: 'Súper', created_at: '2026-06-13T10:00:00.000Z' },
    ]);
    mockDb.getFirstAsync.mockResolvedValueOnce({ total: 2, done: 1 });

    const lists = await ListRepository.getLists();

    expect(lists).toEqual([
      { id: 'l1', name: 'Súper', total_items: 2, done_items: 1, created_at: '2026-06-13T10:00:00.000Z' },
    ]);
  });

  it('getList devuelve la lista y mapea items (purchased int->bool)', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce({
      id: 'l1',
      name: 'Súper',
      created_at: '2026-06-13T10:00:00.000Z',
    });
    mockDb.getAllAsync.mockResolvedValueOnce([
      { id: 'i1', list_id: 'l1', name: 'Leche', quantity: 2, purchased: 1, created_at: 'x' },
      { id: 'i2', list_id: 'l1', name: 'Pan', quantity: 1, purchased: 0, created_at: 'y' },
    ]);

    const { list, items } = await ListRepository.getList('l1');

    expect(list.total_items).toBe(2);
    expect(list.done_items).toBe(1);
    expect(items[0]).toEqual({
      id: 'i1',
      list_id: 'l1',
      name: 'Leche',
      quantity: 2,
      purchased: true,
      created_at: 'x',
    });
  });

  it('createList inserta y devuelve la lista con id generado', async () => {
    const r = await ListRepository.createList('Nueva');

    const [sql, id, name] = mockDb.runAsync.mock.calls[0];
    expect(sql).toContain('INSERT INTO lists');
    expect(id).toBe('uuid-fixed');
    expect(name).toBe('Nueva');
    expect(r).toMatchObject({ id: 'uuid-fixed', name: 'Nueva', total_items: 0, done_items: 0 });
  });

  it('addItem inserta el item con quantity 1 y purchased 0', async () => {
    const item = await ListRepository.addItem('l1', 'Huevos');

    const [sql, id, listId, name] = mockDb.runAsync.mock.calls[0];
    expect(sql).toContain('INSERT INTO list_items');
    expect(id).toBe('uuid-fixed');
    expect(listId).toBe('l1');
    expect(name).toBe('Huevos');
    expect(item).toMatchObject({ id: 'uuid-fixed', list_id: 'l1', name: 'Huevos', quantity: 1, purchased: false });
  });

  it('setPurchased actualiza y devuelve el item mapeado', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce({
      id: 'i1',
      list_id: 'l1',
      name: 'Leche',
      quantity: 1,
      purchased: 1,
      created_at: 'x',
    });

    const item = await ListRepository.setPurchased('l1', 'i1', true);

    const [sql, purchased, itemId, listId] = mockDb.runAsync.mock.calls[0];
    expect(sql).toContain('UPDATE list_items SET purchased');
    expect(purchased).toBe(1);
    expect(itemId).toBe('i1');
    expect(listId).toBe('l1');
    expect(item.purchased).toBe(true);
  });

  it('deleteList borra items y luego la lista', async () => {
    await ListRepository.deleteList('l1');

    expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
    expect(mockDb.runAsync.mock.calls[0][0]).toContain('DELETE FROM list_items');
    expect(mockDb.runAsync.mock.calls[1][0]).toContain('DELETE FROM lists');
  });
});
