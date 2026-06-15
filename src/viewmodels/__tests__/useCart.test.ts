import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useCart } from '../useCart';
import { createQueryWrapper } from '@/test-utils/queryWrapper';
import CartRepository from '@/repositories/CartRepository';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';
import { AuthSessionExpiredError, UserFriendlyError } from '@/types/errors';
import { CartItemWithProduct, CartWithItems, TaxSummary } from '@/types/domain';

jest.mock('@/repositories/CartRepository', () => ({
  __esModule: true,
  default: {
    getCart: jest.fn(),
    updateItemQuantity: jest.fn(),
    deleteItem: jest.fn(),
  },
}));

jest.mock('@/services/ErrorTranslationService', () => ({
  ErrorTranslationService: { translate: jest.fn() },
}));

const mockedGetCart = jest.mocked(CartRepository.getCart);
const mockedUpdateQty = jest.mocked(CartRepository.updateItemQuantity);
const mockedDeleteItem = jest.mocked(CartRepository.deleteItem);
const mockedTranslate = jest.mocked(ErrorTranslationService.translate);

const item: CartItemWithProduct = {
  id: 'i1',
  cart_id: 'c1',
  product_id: 'p1',
  quantity: 2,
  unit_price: 1000,
  product: {
    id: 'p1',
    name: 'Yerba',
    barcode: '779',
    brand: 'Playadito',
    image_url: null,
    price: 1000,
  },
};

const cartData: {
  cart: CartWithItems | null;
  items: CartItemWithProduct[];
  total: number;
  summary: TaxSummary;
} = {
  cart: { id: 'c1', user_id: 'u1', status: 'active', cart_items: [item] },
  items: [item],
  total: 2000,
  summary: { subtotal_net: 1652.9, taxes: [], total: 2000 },
};

const translated: UserFriendlyError = {
  title: 'Algo salió mal',
  message: 'Ocurrió un error inesperado.',
  code: 'UNKNOWN',
};

describe('useCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetCart.mockResolvedValue(cartData);
    mockedUpdateQty.mockResolvedValue(undefined);
    mockedDeleteItem.mockResolvedValue(undefined);
    mockedTranslate.mockReturnValue(translated);
  });

  it('carga el carrito al montar y apaga el loading', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.cart).toEqual(cartData.cart);
    expect(result.current.items).toEqual(cartData.items);
    expect(result.current.total).toBe(2000);
    expect(result.current.summary).toEqual(cartData.summary);
    expect(result.current.error).toBeNull();
  });

  it('error en la carga: traduce y expone el error', async () => {
    mockedGetCart.mockRejectedValueOnce(new Error('Request failed with status 500'));
    const { result } = renderHook(() => useCart(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedTranslate).toHaveBeenCalled();
    expect(result.current.error).toEqual(translated);
  });

  it('sesión expirada en la carga: no expone error al usuario', async () => {
    mockedGetCart.mockRejectedValueOnce(new AuthSessionExpiredError());
    const { result } = renderHook(() => useCart(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(mockedTranslate).not.toHaveBeenCalled();
  });

  it('refresh vuelve a pedir el carrito', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockedGetCart).toHaveBeenCalledTimes(2);
  });

  it('updateQuantity actualiza y refresca el carrito', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateQuantity('i1', 5);
    });

    expect(mockedUpdateQty).toHaveBeenCalledWith('i1', 5);
    expect(mockedGetCart).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
  });

  it('updateQuantity con error: traduce y no deja loading colgado', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    mockedUpdateQty.mockRejectedValueOnce(new Error('Request failed with status 400'));

    await act(async () => {
      await result.current.updateQuantity('i1', 5);
    });

    await waitFor(() => expect(result.current.error).toEqual(translated));
    expect(result.current.isLoading).toBe(false);
  });

  it('removeItem elimina y refresca el carrito', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.removeItem('i1');
    });

    expect(mockedDeleteItem).toHaveBeenCalledWith('i1');
    expect(mockedGetCart).toHaveBeenCalledTimes(2);
  });

  it('removeItem con error: traduce y corta el loading', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    mockedDeleteItem.mockRejectedValueOnce(new Error('Request failed with status 500'));

    await act(async () => {
      await result.current.removeItem('i1');
    });

    await waitFor(() => expect(result.current.error).toEqual(translated));
    expect(result.current.isLoading).toBe(false);
  });

  it('refresh limpia un error de mutación previo', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockedDeleteItem.mockRejectedValueOnce(new Error('Request failed with status 500'));
    await act(async () => {
      await result.current.removeItem('i1');
    });
    await waitFor(() => expect(result.current.error).toEqual(translated));

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => expect(result.current.error).toBeNull());
  });
});
