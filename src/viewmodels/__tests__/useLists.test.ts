import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLists } from '../useLists';
import * as ListRepository from '@/repositories/ListRepository';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';
import { ShoppingList } from '@/types/domain';

jest.mock('@/repositories/ListRepository', () => ({
  getLists: jest.fn(),
  createList: jest.fn(),
  deleteList: jest.fn(),
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

const list: ShoppingList = {
  id: 'l1',
  name: 'Súper',
  total_items: 0,
  done_items: 0,
  created_at: '2026-06-10T00:00:00.000Z',
};

describe('useLists', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repo.getLists.mockResolvedValue([list]);
    repo.createList.mockResolvedValue(list);
    repo.deleteList.mockResolvedValue(undefined);
  });

  it('carga las listas al montar', async () => {
    const { result } = renderHook(() => useLists());
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.lists).toEqual([list]);
    expect(result.current.error).toBeNull();
  });

  it('createList ignora un nombre vacío tras trimear', async () => {
    const { result } = renderHook(() => useLists());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createList('   ');
    });
    expect(repo.createList).not.toHaveBeenCalled();
  });

  it('createList crea con el nombre trimeado y refresca', async () => {
    const { result } = renderHook(() => useLists());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    repo.getLists.mockClear();

    await act(async () => {
      await result.current.createList('  Verdulería  ');
    });
    expect(repo.createList).toHaveBeenCalledWith('Verdulería');
    expect(repo.getLists).toHaveBeenCalledTimes(1);
  });

  it('deleteList borra y refresca', async () => {
    const { result } = renderHook(() => useLists());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    repo.getLists.mockClear();

    await act(async () => {
      await result.current.deleteList('l1');
    });
    expect(repo.deleteList).toHaveBeenCalledWith('l1');
    expect(repo.getLists).toHaveBeenCalledTimes(1);
  });

  it('refresh vuelve a leer las listas', async () => {
    const { result } = renderHook(() => useLists());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    repo.getLists.mockResolvedValueOnce([list, { ...list, id: 'l2', name: 'Farmacia' }]);
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.lists).toHaveLength(2);
  });

  describe('errores traducidos por ErrorTranslationService', () => {
    it('setea error si falla la carga inicial', async () => {
      repo.getLists.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useLists());

      await waitFor(() => expect(result.current.error).not.toBeNull());
      expect(result.current.error?.code).toBe('UNKNOWN');
      expect(ErrorTranslationService.translate).toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    it('setea error si falla createList', async () => {
      repo.createList.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useLists());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.createList('X');
      });
      expect(result.current.error?.code).toBe('UNKNOWN');
    });

    it('setea error si falla deleteList', async () => {
      repo.deleteList.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useLists());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.deleteList('l1');
      });
      expect(result.current.error?.code).toBe('UNKNOWN');
    });
  });
});
