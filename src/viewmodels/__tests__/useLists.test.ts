import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLists } from '../useLists';
import ListRepository from '@/repositories/ListRepository';

jest.mock('@/repositories/ListRepository', () => ({
  __esModule: true,
  default: { getLists: jest.fn(), createList: jest.fn() },
}));
jest.mock('@/services/ErrorTranslationService', () => ({
  ErrorTranslationService: { translate: jest.fn(() => ({ title: 'E', message: 'm', code: 'X' })) },
}));

const mockedGetLists = jest.mocked(ListRepository.getLists);
const mockedCreate = jest.mocked(ListRepository.createList);

const list = { id: 'l1', name: 'Súper', total_items: 0, done_items: 0 };

describe('useLists', () => {
  beforeEach(() => jest.clearAllMocks());

  it('carga las listas al montar', async () => {
    mockedGetLists.mockResolvedValue([list]);
    const { result } = renderHook(() => useLists());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.lists).toEqual([list]);
  });

  it('createList crea y refresca el listado', async () => {
    mockedGetLists.mockResolvedValue([]);
    const { result } = renderHook(() => useLists());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockedCreate.mockResolvedValue(list);
    mockedGetLists.mockResolvedValue([list]);
    await act(async () => {
      await result.current.createList('Súper');
    });

    expect(mockedCreate).toHaveBeenCalledWith('Súper');
    expect(result.current.lists).toEqual([list]);
  });
});
