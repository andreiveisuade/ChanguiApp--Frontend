import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useListDetail } from '../useListDetail';
import { createQueryWrapper } from '@/test-utils/queryWrapper';
import * as ListRepository from '@/repositories/ListRepository';
import { Product, ShoppingListItem } from '@/types/domain';

jest.mock('@/repositories/ListRepository', () => ({
  getListItems: jest.fn(),
  addItem: jest.fn(),
  toggleItem: jest.fn(),
  setItemQuantity: jest.fn(),
  deleteItem: jest.fn(),
}));
jest.mock('@/services/ErrorTranslationService', () => ({
  ErrorTranslationService: {
    translate: jest.fn(() => ({
      title: 'Error',
      message: 'msg',
      actionLabel: 'Reintentar',
      code: 'UNKNOWN',
    })),
  },
}));

const repo = ListRepository as jest.Mocked<typeof ListRepository>;

const product: Product = {
  id: 'p1',
  name: 'Leche',
  barcode: '779',
  brand: null,
  image_url: null,
  price: 1500,
};

const item: ShoppingListItem = {
  id: 'i1',
  list_id: 'l1',
  barcode: '779',
  name: 'Leche',
  brand: null,
  price: 1500,
  image_url: null,
  quantity: 1,
  purchased: false,
  created_at: '2026-06-10T00:00:00.000Z',
};

describe('useListDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repo.getListItems.mockResolvedValue([item]);
    repo.addItem.mockResolvedValue(undefined);
    repo.toggleItem.mockResolvedValue(undefined);
    repo.setItemQuantity.mockResolvedValue(undefined);
    repo.deleteItem.mockResolvedValue(undefined);
  });

  it('no carga ítems cuando no hay listId', async () => {
    const { result } = renderHook(() => useListDetail(undefined), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(repo.getListItems).not.toHaveBeenCalled();
    expect(result.current.items).toEqual([]);
  });

  it('carga los ítems de la lista al montar', async () => {
    const { result } = renderHook(() => useListDetail('l1'), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(repo.getListItems).toHaveBeenCalledWith('l1');
    expect(result.current.items).toEqual([item]);
  });

  it('addProduct agrega el producto y recarga en silencio', async () => {
    const { result } = renderHook(() => useListDetail('l1'), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    repo.getListItems.mockClear();

    await act(async () => {
      await result.current.addProduct(product);
    });
    expect(repo.addItem).toHaveBeenCalledWith('l1', product);
    expect(repo.getListItems).toHaveBeenCalledTimes(1);
  });

  it('addProduct no hace nada sin listId', async () => {
    const { result } = renderHook(() => useListDetail(undefined), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addProduct(product);
    });
    expect(repo.addItem).not.toHaveBeenCalled();
  });

  it('toggleItem, setQuantity y removeItem mutan y recargan', async () => {
    const { result } = renderHook(() => useListDetail('l1'), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.toggleItem('i1');
    });
    await act(async () => {
      await result.current.setQuantity('i1', 3);
    });
    await act(async () => {
      await result.current.removeItem('i1');
    });

    expect(repo.toggleItem).toHaveBeenCalledWith('i1');
    expect(repo.setItemQuantity).toHaveBeenCalledWith('i1', 3);
    expect(repo.deleteItem).toHaveBeenCalledWith('i1');
  });

  it('refresh vuelve a leer los ítems', async () => {
    const { result } = renderHook(() => useListDetail('l1'), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    repo.getListItems.mockClear();

    await act(async () => {
      await result.current.refresh();
    });
    expect(repo.getListItems).toHaveBeenCalledWith('l1');
  });

  describe('errores traducidos por ErrorTranslationService', () => {
    it('setea error si falla la carga de ítems', async () => {
      repo.getListItems.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useListDetail('l1'), { wrapper: createQueryWrapper() });

      await waitFor(() => expect(result.current.error).not.toBeNull());
      await waitFor(() => expect(result.current.error?.code).toBe('UNKNOWN'));
      expect(result.current.isLoading).toBe(false);
    });

    it('setea error si falla toggleItem', async () => {
      repo.toggleItem.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useListDetail('l1'), { wrapper: createQueryWrapper() });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.toggleItem('i1');
      });
      await waitFor(() => expect(result.current.error?.code).toBe('UNKNOWN'));
    });

    it('setea error si falla addProduct, setQuantity o removeItem', async () => {
      const { result } = renderHook(() => useListDetail('l1'), { wrapper: createQueryWrapper() });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      repo.addItem.mockRejectedValueOnce(new Error('boom'));
      await act(async () => {
        await result.current.addProduct(product);
      });
      await waitFor(() => expect(result.current.error?.code).toBe('UNKNOWN'));

      repo.setItemQuantity.mockRejectedValueOnce(new Error('boom'));
      await act(async () => {
        await result.current.setQuantity('i1', 2);
      });
      await waitFor(() => expect(result.current.error?.code).toBe('UNKNOWN'));

      repo.deleteItem.mockRejectedValueOnce(new Error('boom'));
      await act(async () => {
        await result.current.removeItem('i1');
      });
      await waitFor(() => expect(result.current.error?.code).toBe('UNKNOWN'));
    });
  });
});
