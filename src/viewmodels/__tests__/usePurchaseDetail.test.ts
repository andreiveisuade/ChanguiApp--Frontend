import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePurchaseDetail } from '../usePurchaseDetail';
import PurchaseRepository from '@/repositories/PurchaseRepository';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';
import { AuthSessionExpiredError, UserFriendlyError } from '@/types/errors';
import { PurchaseDetail } from '@/types/domain';

jest.mock('@/repositories/PurchaseRepository', () => ({
  __esModule: true,
  default: {
    getPurchaseById: jest.fn(),
  },
}));

jest.mock('@/services/ErrorTranslationService', () => ({
  ErrorTranslationService: { translate: jest.fn() },
}));

const mockedGetById = jest.mocked(PurchaseRepository.getPurchaseById);
const mockedTranslate = jest.mocked(ErrorTranslationService.translate);

const detail: PurchaseDetail = {
  id: 'pur1',
  store_name: 'Coto',
  date: '2026-06-01T12:00:00Z',
  total: 1500,
  status: 'completed',
  item_count: 1,
  items: [
    { id: 'it1', purchase_id: 'pur1', product_name: 'Yerba', barcode: '779', quantity: 2, unit_price: 500 },
  ],
};

const translated: UserFriendlyError = {
  title: 'Algo salió mal',
  message: 'Ocurrió un error inesperado.',
  code: 'UNKNOWN',
};

describe('usePurchaseDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetById.mockResolvedValue(detail);
    mockedTranslate.mockReturnValue(translated);
  });

  it('carga el detalle al montar y apaga el loading', async () => {
    const { result } = renderHook(() => usePurchaseDetail('pur1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedGetById).toHaveBeenCalledWith('pur1');
    expect(result.current.purchase).toEqual(detail);
    expect(result.current.error).toBeNull();
  });

  it('error en la carga: traduce y expone el error', async () => {
    mockedGetById.mockRejectedValueOnce(new Error('Request failed with status 404'));
    const { result } = renderHook(() => usePurchaseDetail('pur1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedTranslate).toHaveBeenCalled();
    expect(result.current.error).toEqual(translated);
    expect(result.current.purchase).toBeNull();
  });

  it('sesión expirada en la carga: no expone error al usuario', async () => {
    mockedGetById.mockRejectedValueOnce(new AuthSessionExpiredError());
    const { result } = renderHook(() => usePurchaseDetail('pur1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(mockedTranslate).not.toHaveBeenCalled();
  });

  it('sin id: no pega al repo y apaga el loading', async () => {
    const { result } = renderHook(() => usePurchaseDetail(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedGetById).not.toHaveBeenCalled();
    expect(result.current.purchase).toBeNull();
  });

  it('refresh vuelve a pedir el detalle', async () => {
    const { result } = renderHook(() => usePurchaseDetail('pur1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockedGetById).toHaveBeenCalledTimes(2);
  });
});
