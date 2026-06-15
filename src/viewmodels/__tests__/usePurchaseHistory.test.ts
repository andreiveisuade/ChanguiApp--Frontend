import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePurchaseHistory } from '../usePurchaseHistory';
import { createQueryWrapper } from '@/test-utils/queryWrapper';
import PurchaseRepository from '@/repositories/PurchaseRepository';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';
import { AuthSessionExpiredError, UserFriendlyError } from '@/types/errors';
import { Purchase } from '@/types/domain';

jest.mock('@/repositories/PurchaseRepository', () => ({
  __esModule: true,
  default: {
    getPurchases: jest.fn(),
  },
}));

jest.mock('@/services/ErrorTranslationService', () => ({
  ErrorTranslationService: { translate: jest.fn() },
}));

const mockedGetPurchases = jest.mocked(PurchaseRepository.getPurchases);
const mockedTranslate = jest.mocked(ErrorTranslationService.translate);

const purchase: Purchase = {
  id: 'pur1',
  store_name: 'Coto',
  date: '2026-06-01T12:00:00Z',
  total: 1500,
  status: 'completed',
};

const translated: UserFriendlyError = {
  title: 'Algo salió mal',
  message: 'Ocurrió un error inesperado.',
  code: 'UNKNOWN',
};

describe('usePurchaseHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetPurchases.mockResolvedValue([purchase]);
    mockedTranslate.mockReturnValue(translated);
  });

  it('carga el historial al montar y apaga el loading', async () => {
    const { result } = renderHook(() => usePurchaseHistory(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.purchases).toEqual([purchase]);
    expect(result.current.error).toBeNull();
  });

  it('error en la carga: traduce y expone el error', async () => {
    mockedGetPurchases.mockRejectedValueOnce(new Error('Request failed with status 500'));
    const { result } = renderHook(() => usePurchaseHistory(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedTranslate).toHaveBeenCalled();
    expect(result.current.error).toEqual(translated);
    expect(result.current.purchases).toEqual([]);
  });

  it('sesión expirada en la carga: no expone error al usuario', async () => {
    mockedGetPurchases.mockRejectedValueOnce(new AuthSessionExpiredError());
    const { result } = renderHook(() => usePurchaseHistory(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(mockedTranslate).not.toHaveBeenCalled();
  });

  it('refresh vuelve a pedir el historial', async () => {
    const { result } = renderHook(() => usePurchaseHistory(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockedGetPurchases).toHaveBeenCalledTimes(2);
  });
});
