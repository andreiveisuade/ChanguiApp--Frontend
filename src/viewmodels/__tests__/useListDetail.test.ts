import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useListDetail } from '../useListDetail';
import ListRepository from '@/repositories/ListRepository';

jest.mock('@/repositories/ListRepository', () => ({
  __esModule: true,
  default: {
    getList: jest.fn(),
    addItem: jest.fn(),
    setPurchased: jest.fn(),
    deleteList: jest.fn(),
  },
}));
jest.mock('@/services/ErrorTranslationService', () => ({
  ErrorTranslationService: { translate: jest.fn(() => ({ title: 'E', message: 'm', code: 'X' })) },
}));

const mockedGetList = jest.mocked(ListRepository.getList);
const mockedAdd = jest.mocked(ListRepository.addItem);
const mockedSet = jest.mocked(ListRepository.setPurchased);
const mockedDelete = jest.mocked(ListRepository.deleteList);

const item = { id: 'i1', list_id: 'l1', name: 'Leche', quantity: 1, purchased: false };
const listMeta = { id: 'l1', name: 'Súper', total_items: 1, done_items: 0 };

describe('useListDetail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('carga los items al montar', async () => {
    mockedGetList.mockResolvedValue({ list: listMeta, items: [item] });
    const { result } = renderHook(() => useListDetail('l1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toEqual([item]);
  });

  it('addItem agrega el item devuelto', async () => {
    mockedGetList.mockResolvedValue({ list: listMeta, items: [] });
    const { result } = renderHook(() => useListDetail('l1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockedAdd.mockResolvedValue(item);
    await act(async () => {
      await result.current.addItem('Leche');
    });
    expect(mockedAdd).toHaveBeenCalledWith('l1', 'Leche');
    expect(result.current.items).toContainEqual(item);
  });

  it('toggleItem invierte purchased', async () => {
    mockedGetList.mockResolvedValue({ list: listMeta, items: [item] });
    const { result } = renderHook(() => useListDetail('l1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockedSet.mockResolvedValue({ ...item, purchased: true });
    await act(async () => {
      await result.current.toggleItem(item);
    });
    expect(mockedSet).toHaveBeenCalledWith('l1', 'i1', true);
    expect(result.current.items[0].purchased).toBe(true);
  });

  it('removeList borra y devuelve true', async () => {
    mockedGetList.mockResolvedValue({ list: listMeta, items: [] });
    const { result } = renderHook(() => useListDetail('l1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockedDelete.mockResolvedValue(undefined);
    let ok = false;
    await act(async () => {
      ok = await result.current.removeList();
    });
    expect(mockedDelete).toHaveBeenCalledWith('l1');
    expect(ok).toBe(true);
  });
});
