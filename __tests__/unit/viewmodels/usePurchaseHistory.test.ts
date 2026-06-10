/**
 * Unit tests for usePurchaseHistory viewmodel.
 *
 * PurchaseRepository is mocked so tests run without network access or Supabase auth.
 * Uses @testing-library/react-hooks (renderHook) as per TESTING.md patterns.
 */

jest.mock('@/repositories/PurchaseRepository', () => ({
  __esModule: true,
  default: {
    getPurchases: jest.fn(),
  },
}));

import { renderHook, act } from '@testing-library/react-hooks';
import PurchaseRepository from '@/repositories/PurchaseRepository';
import { usePurchaseHistory } from '@/viewmodels/usePurchaseHistory';

const mockGetPurchases = PurchaseRepository.getPurchases as jest.Mock;

const MOCK_PURCHASE = {
  id: 'pur1',
  store_name: 'Coto',
  date: '2026-06-01T12:00:00Z',
  total: 1500,
  status: 'completed' as const,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('usePurchaseHistory', () => {
  it('starts with isLoading true and empty data', () => {
    // Never resolves — keeps the hook in its initial loading state
    mockGetPurchases.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePurchaseHistory());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.purchases).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('populates purchases on successful fetch', async () => {
    mockGetPurchases.mockResolvedValue([MOCK_PURCHASE]);

    const { result, waitForNextUpdate } = renderHook(() => usePurchaseHistory());
    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.purchases).toHaveLength(1);
    expect(result.current.purchases[0].store_name).toBe('Coto');
    expect(result.current.error).toBeNull();
  });

  it('sets error message and clears loading on fetch failure', async () => {
    mockGetPurchases.mockRejectedValue(new Error('Request failed with status 500'));

    const { result, waitForNextUpdate } = renderHook(() => usePurchaseHistory());
    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Request failed with status 500');
    expect(result.current.purchases).toEqual([]);
  });

  it('calls getPurchases again and updates state on refresh()', async () => {
    mockGetPurchases
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([MOCK_PURCHASE]);

    const { result, waitForNextUpdate } = renderHook(() => usePurchaseHistory());
    await waitForNextUpdate();

    expect(result.current.purchases).toEqual([]);

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockGetPurchases).toHaveBeenCalledTimes(2);
    expect(result.current.purchases).toHaveLength(1);
  });
});
