import { renderHook, act } from '@testing-library/react-native';
import { Vibration } from 'react-native';
import { useScanner } from '../useScanner';
import { getProductByBarcode } from '@/repositories/ScannerRepository';
import { Product } from '@/types/domain';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/repositories/ScannerRepository', () => ({
  getProductByBarcode: jest.fn(),
}));

const mockedGetProduct = jest.mocked(getProductByBarcode);

const product: Product = {
  id: 'p1',
  name: 'Yerba Playadito',
  barcode: '7790001',
  brand: 'Playadito',
  image_url: null,
  price: 1000,
};

describe('useScanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});
  });

  it('scan exitoso: vibra y navega a product-found con el producto serializado', async () => {
    mockedGetProduct.mockResolvedValue(product);
    const { result } = renderHook(() => useScanner());

    await act(async () => {
      await result.current.handleBarcodeScanned({ data: '7790001' });
    });

    expect(Vibration.vibrate).toHaveBeenCalledWith(200);
    expect(mockedGetProduct).toHaveBeenCalledWith('7790001');
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/product-found',
      params: { product: JSON.stringify(product), barcode: '7790001' },
    });
    expect(result.current.scanned).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('producto no encontrado (null): igual navega para mostrar el estado vacío', async () => {
    mockedGetProduct.mockResolvedValue(null);
    const { result } = renderHook(() => useScanner());

    await act(async () => {
      await result.current.handleBarcodeScanned({ data: '0000000' });
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/product-found',
      params: { product: JSON.stringify(null), barcode: '0000000' },
    });
  });

  it('no dispara un segundo scan mientras ya escaneó (lock)', async () => {
    mockedGetProduct.mockResolvedValue(product);
    const { result } = renderHook(() => useScanner());

    await act(async () => {
      await result.current.handleBarcodeScanned({ data: '7790001' });
    });
    await act(async () => {
      await result.current.handleBarcodeScanned({ data: '7790001' });
    });

    expect(mockedGetProduct).toHaveBeenCalledTimes(1);
  });

  it('error de red: setea errorMessage y corta el loading', async () => {
    mockedGetProduct.mockRejectedValue(new Error('network timeout'));
    const { result } = renderHook(() => useScanner());

    await act(async () => {
      await result.current.handleBarcodeScanned({ data: '7790001' });
    });

    expect(result.current.errorMessage).toBe('network timeout');
    expect(result.current.loading).toBe(false);
  });

  it('resetScanner limpia el estado para permitir un nuevo scan', async () => {
    mockedGetProduct.mockResolvedValue(product);
    const { result } = renderHook(() => useScanner());

    await act(async () => {
      await result.current.handleBarcodeScanned({ data: '7790001' });
    });
    act(() => {
      result.current.resetScanner();
    });

    expect(result.current.scanned).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.errorMessage).toBeNull();
  });

  it('clearError limpia solo el mensaje de error', async () => {
    mockedGetProduct.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useScanner());

    await act(async () => {
      await result.current.handleBarcodeScanned({ data: '7790001' });
    });
    act(() => {
      result.current.clearError();
    });

    expect(result.current.errorMessage).toBeNull();
  });
});
