import { renderHook, act } from '@testing-library/react-native';
import { useProductSearch } from '../useProductSearch';
import * as ProductCatalogRepository from '@/repositories/ProductCatalogRepository';
import { Product } from '@/types/domain';

jest.mock('@/repositories/ProductCatalogRepository', () => ({
  searchProducts: jest.fn(),
}));

const mockedSearch = ProductCatalogRepository.searchProducts as jest.Mock;

const product: Product = {
  id: 'p1',
  name: 'Leche',
  barcode: '779',
  brand: null,
  image_url: null,
  price: 100,
};

describe('useProductSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedSearch.mockReset();
    mockedSearch.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('no busca con menos del mínimo de caracteres', () => {
    const { result } = renderHook(() => useProductSearch({ minChars: 2 }));
    act(() => result.current.setQuery('a'));
    act(() => jest.advanceTimersByTime(300));
    expect(mockedSearch).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
  });

  it('busca tras el debounce y expone los resultados', async () => {
    mockedSearch.mockResolvedValue([product]);
    const { result } = renderHook(() => useProductSearch({ minChars: 2, debounceMs: 250, limit: 20 }));

    act(() => result.current.setQuery('leche'));
    expect(mockedSearch).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(250);
    });

    expect(mockedSearch).toHaveBeenCalledWith('leche', 20);
    expect(result.current.results).toEqual([product]);
  });

  it('cancela el debounce anterior al seguir tipeando (solo busca la última query)', async () => {
    const { result } = renderHook(() => useProductSearch({ minChars: 2, debounceMs: 250, limit: 20 }));

    act(() => result.current.setQuery('le'));
    act(() => jest.advanceTimersByTime(100));
    act(() => result.current.setQuery('lech'));

    await act(async () => {
      jest.advanceTimersByTime(250);
    });

    expect(mockedSearch).toHaveBeenCalledTimes(1);
    expect(mockedSearch).toHaveBeenCalledWith('lech', 20);
  });

  it('limpia los resultados al borrar la query por debajo del mínimo', async () => {
    mockedSearch.mockResolvedValue([product]);
    const { result } = renderHook(() => useProductSearch({ minChars: 2 }));

    act(() => result.current.setQuery('leche'));
    await act(async () => {
      jest.advanceTimersByTime(250);
    });
    expect(result.current.results).toEqual([product]);

    act(() => result.current.setQuery('l'));
    expect(result.current.results).toEqual([]);
  });
});
