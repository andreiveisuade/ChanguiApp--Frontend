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

// Cada test parte de un carrito recién cargado.
const renderLoadedCart = async () => {
  const utils = renderHook(() => useCart(), { wrapper: createQueryWrapper() });
  await waitFor(() => expect(utils.result.current.isLoading).toBe(false));
  return utils;
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
    const { result } = await renderLoadedCart();

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
    const { result } = await renderLoadedCart();

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockedGetCart).toHaveBeenCalledTimes(2);
  });

  it('updateQuantity actualiza el carrito al instante sin pegarle al backend', async () => {
    const { result } = await renderLoadedCart();

    await act(async () => {
      await result.current.updateQuantity('i1', 5);
    });

    // Actualización optimista: cantidad y total ya reflejan el cambio.
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.total).toBe(5000);
    // El PUT está en debounce: todavía no se llamó al backend.
    expect(mockedUpdateQty).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('una ráfaga de toques coalesce en un único PUT con la cantidad final', async () => {
    const { result } = await renderLoadedCart();

    await act(async () => {
      await result.current.updateQuantity('i1', 3);
      await result.current.updateQuantity('i1', 4);
      await result.current.updateQuantity('i1', 6);
    });

    await act(async () => {
      await result.current.flushPending();
    });

    expect(mockedUpdateQty).toHaveBeenCalledTimes(1);
    expect(mockedUpdateQty).toHaveBeenCalledWith('i1', 6);
    // No se refetchea el carrito en cada toque (era el origen de la latencia).
    expect(mockedGetCart).toHaveBeenCalledTimes(1);
  });

  it('el debounce dispara el PUT solo, sin flush manual', async () => {
    const { result } = await renderLoadedCart();

    await act(async () => {
      await result.current.updateQuantity('i1', 5);
    });

    await waitFor(() => expect(mockedUpdateQty).toHaveBeenCalledWith('i1', 5));
    expect(mockedUpdateQty).toHaveBeenCalledTimes(1);
  });

  it('updateQuantity con error: traduce el error al hacer flush', async () => {
    mockedUpdateQty.mockRejectedValueOnce(new Error('Request failed with status 400'));
    const { result } = await renderLoadedCart();

    await act(async () => {
      await result.current.updateQuantity('i1', 5);
      // flushPending rechaza si un envío falla, para que el pago pueda abortar.
      await expect(result.current.flushPending()).rejects.toThrow();
    });

    await waitFor(() => expect(result.current.error).toEqual(translated));
  });

  it('removeItem elimina del carrito al instante y borra en el backend', async () => {
    const { result } = await renderLoadedCart();

    await act(async () => {
      await result.current.removeItem('i1');
    });

    expect(mockedDeleteItem).toHaveBeenCalledWith('i1');
    expect(result.current.items).toHaveLength(0);
    // En el camino feliz no se refetchea: alcanza con la baja optimista.
    expect(mockedGetCart).toHaveBeenCalledTimes(1);
  });

  it('removeItem con error: traduce y revierte pidiendo el carrito', async () => {
    mockedDeleteItem.mockRejectedValueOnce(new Error('Request failed with status 500'));
    const { result } = await renderLoadedCart();

    await act(async () => {
      await result.current.removeItem('i1');
    });

    await waitFor(() => expect(result.current.error).toEqual(translated));
    expect(mockedGetCart).toHaveBeenCalledTimes(2);
  });

  it('refresh limpia un error de mutación previo', async () => {
    mockedDeleteItem.mockRejectedValueOnce(new Error('Request failed with status 500'));
    const { result } = await renderLoadedCart();

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
