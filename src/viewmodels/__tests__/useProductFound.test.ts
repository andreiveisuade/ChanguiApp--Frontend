import { renderHook, act } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import { useProductFound } from '../useProductFound';
import { createQueryWrapper } from '@/test-utils/queryWrapper';
import CartRepository from '@/repositories/CartRepository';
import { Product } from '@/types/domain';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@/repositories/CartRepository', () => ({
  __esModule: true,
  default: { addItem: jest.fn() },
}));

const mockedParams = jest.mocked(useLocalSearchParams);
const mockedAddItem = jest.mocked(CartRepository.addItem);

const productConTax: Product = {
  id: 'p1',
  name: 'Yerba Playadito',
  barcode: '7790001',
  brand: 'Playadito',
  image_url: null,
  price: 1000,
  tax: { category: 'IVA', rate: 21, net_price: 826.45, tax_amount: 173.55 },
};

const setParams = (params: Record<string, string | undefined>) => {
  mockedParams.mockReturnValue(params as ReturnType<typeof useLocalSearchParams>);
};

describe('useProductFound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setParams({ product: JSON.stringify(productConTax), barcode: '7790001' });
  });

  it('parsea el producto de los params y expone el barcode', () => {
    const { result } = renderHook(() => useProductFound(), { wrapper: createQueryWrapper() });
    expect(result.current.product).toEqual(productConTax);
    expect(result.current.barcode).toBe('7790001');
  });

  it('calcula subtotal, neto, IVA y tasa según la cantidad', () => {
    const { result } = renderHook(() => useProductFound(), { wrapper: createQueryWrapper() });

    expect(result.current.subtotal).toBe(1000);
    expect(result.current.netSubtotal).toBe(826.45);
    expect(result.current.ivaSubtotal).toBe(173.55);
    expect(result.current.taxRate).toBe(21);

    act(() => result.current.incrementQuantity());

    expect(result.current.subtotal).toBe(2000);
    expect(result.current.ivaSubtotal).toBeCloseTo(347.1);
  });

  it('sin desglose de tax: neto = subtotal, IVA 0 y tasa 0', () => {
    const sinTax: Product = { ...productConTax, tax: undefined };
    setParams({ product: JSON.stringify(sinTax), barcode: '7790001' });

    const { result } = renderHook(() => useProductFound(), { wrapper: createQueryWrapper() });

    expect(result.current.netSubtotal).toBe(1000);
    expect(result.current.ivaSubtotal).toBe(0);
    expect(result.current.taxRate).toBe(0);
  });

  it('params sin producto: product null, subtotal 0 y barcode vacío', () => {
    setParams({ product: undefined, barcode: undefined });
    const { result } = renderHook(() => useProductFound(), { wrapper: createQueryWrapper() });
    expect(result.current.product).toBeNull();
    expect(result.current.subtotal).toBe(0);
    expect(result.current.barcode).toBe('');
  });

  it('JSON inválido en params: product null', () => {
    setParams({ product: '{no-es-json', barcode: '7790001' });
    const { result } = renderHook(() => useProductFound(), { wrapper: createQueryWrapper() });
    expect(result.current.product).toBeNull();
  });

  it('decrementQuantity no baja de 1', () => {
    const { result } = renderHook(() => useProductFound(), { wrapper: createQueryWrapper() });

    act(() => result.current.decrementQuantity());
    expect(result.current.quantity).toBe(1);

    act(() => result.current.incrementQuantity());
    act(() => result.current.incrementQuantity());
    expect(result.current.quantity).toBe(3);

    act(() => result.current.decrementQuantity());
    expect(result.current.quantity).toBe(2);
  });

  it('goToScanner navega al scanner', () => {
    const { result } = renderHook(() => useProductFound(), { wrapper: createQueryWrapper() });
    act(() => result.current.goToScanner());
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/scanner');
  });

  it('goToCart agrega el item y navega al carrito', async () => {
    mockedAddItem.mockResolvedValue(undefined);
    const { result } = renderHook(() => useProductFound(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.goToCart();
    });

    expect(mockedAddItem).toHaveBeenCalledWith('p1', 1, 1000);
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/cart');
  });

  it('goToCart sin producto no hace nada', async () => {
    setParams({ product: undefined, barcode: undefined });
    const { result } = renderHook(() => useProductFound(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.goToCart();
    });

    expect(mockedAddItem).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('goToCart con error setea errorMessage y corta el loading', async () => {
    mockedAddItem.mockRejectedValue(new Error('falló agregar'));
    const { result } = renderHook(() => useProductFound(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.goToCart();
    });

    expect(result.current.errorMessage).toMatchObject({
      title: expect.any(String),
      message: expect.any(String),
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('clearError limpia el mensaje', async () => {
    mockedAddItem.mockRejectedValue(new Error('x'));
    const { result } = renderHook(() => useProductFound(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.goToCart();
    });
    act(() => result.current.clearError());

    expect(result.current.errorMessage).toBeNull();
  });
});
