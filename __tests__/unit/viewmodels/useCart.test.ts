/**
 * Unit tests for useCart viewmodel.
 *
 * CartRepository is mocked so tests run without network access or Supabase auth.
 * Uses @testing-library/react-native (renderHook) as per TESTING.md patterns.
 */

jest.mock('@/repositories/CartRepository', () => ({
  __esModule: true,
  default: {
    getCart: jest.fn(),
  },
}));

import { renderHook, act, waitFor } from '@testing-library/react-native';
import CartRepository from '@/repositories/CartRepository';
import { useCart } from '@/viewmodels/useCart';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';

const mockGetCart = CartRepository.getCart as jest.Mock;

const MOCK_PRODUCT = {
  id: 'p1',
  name: 'Agua Villavicencio',
  barcode: '77900099',
  brand: null,
  image_url: null,
  price: 500,
};

const MOCK_ITEM = {
  id: 'i1',
  cart_id: 'c1',
  product_id: 'p1',
  quantity: 1,
  unit_price: 500,
  product: MOCK_PRODUCT,
};

const MOCK_CART = {
  id: 'c1',
  user_id: 'u1',
  store_id: 's1',
  status: 'active',
  cart_items: [MOCK_ITEM],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useCart', () => {
  it('starts with isLoading true and empty data', () => {
    mockGetCart.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useCart());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.cart).toBeNull();
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('populates cart, items, and total on successful fetch', async () => {
    mockGetCart.mockResolvedValue({
      cart: MOCK_CART,
      items: [MOCK_ITEM],
      total: 500,
    });

    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.cart).toEqual(MOCK_CART);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.total).toBe(500);
    expect(result.current.error).toBeNull();
  });

  it('sets error and clears loading on fetch failure', async () => {
    mockGetCart.mockRejectedValue(new Error('Network request failed'));
    jest.spyOn(ErrorTranslationService, 'translate').mockReturnValue({
      title: 'Error',
      message: 'algo salió mal',
      code: 'ERR_TEST',
      actionLabel: 'Reintentar',
    });

    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.code).toBe('ERR_TEST');
    expect(result.current.error?.title).toBe('Error');
    expect(result.current.cart).toBeNull();
    expect(result.current.items).toEqual([]);
  });

  it('calls CartRepository.getCart again and updates state on refresh()', async () => {
    mockGetCart
      .mockResolvedValueOnce({ cart: null, items: [], total: 0 })
      .mockResolvedValueOnce({ cart: MOCK_CART, items: [MOCK_ITEM], total: 500 });

    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.total).toBe(0);

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockGetCart).toHaveBeenCalledTimes(2);
    expect(result.current.total).toBe(500);
    expect(result.current.items).toHaveLength(1);
  });
});