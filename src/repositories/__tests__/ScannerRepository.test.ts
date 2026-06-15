import { getProductByBarcode } from '../ScannerRepository';
import httpClient from '@/config/clients';
import * as ProductCatalogRepository from '@/repositories/ProductCatalogRepository';

jest.mock('@/config/clients', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/repositories/ProductCatalogRepository', () => ({
  getProductByBarcode: jest.fn(),
}));

const mockedGet = httpClient.get as jest.Mock;
const mockedLocalLookup = jest.mocked(ProductCatalogRepository.getProductByBarcode);
const axiosResponse = <T>(data: T, status = 200) => ({ data, status });

describe('ScannerRepository.getProductByBarcode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Por defecto el cache local no tiene el producto → cae a la red.
    mockedLocalLookup.mockResolvedValue(null);
  });

  it('cache-first: si el producto está en el catálogo local lo devuelve sin pegarle a la red', async () => {
    const local = {
      id: 'p1',
      name: 'Yerba',
      barcode: '779',
      brand: 'Playadito',
      image_url: null,
      price: 1000,
    };
    mockedLocalLookup.mockResolvedValueOnce(local);

    const result = await getProductByBarcode('779');

    expect(result).toEqual(local);
    expect(mockedLocalLookup).toHaveBeenCalledWith('779');
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it('si el cache local falla, cae a la red sin romper el escaneo', async () => {
    mockedLocalLookup.mockRejectedValueOnce(new Error('sqlite down'));
    const product = {
      id: 'p1',
      name: 'Yerba',
      barcode: '779',
      brand: null,
      image_url: null,
      price: 1000,
    };
    mockedGet.mockResolvedValueOnce(axiosResponse(product, 200));

    const result = await getProductByBarcode('779');

    expect(result).toEqual(product);
    expect(mockedGet).toHaveBeenCalled();
  });

  it('devuelve el producto cuando el backend responde 200', async () => {
    const product = {
      id: 'p1',
      name: 'Yerba',
      barcode: '779',
      brand: 'Playadito',
      image_url: null,
      price: 1000,
    };
    mockedGet.mockResolvedValueOnce(axiosResponse(product, 200));

    const result = await getProductByBarcode('779');

    expect(result).toEqual(product);
    expect(mockedGet).toHaveBeenCalledWith(
      '/api/products/barcode/779',
      expect.objectContaining({ validateStatus: expect.any(Function) }),
    );
  });

  it('devuelve null en 404 (código no está en el catálogo)', async () => {
    mockedGet.mockResolvedValueOnce(axiosResponse({}, 404));

    const result = await getProductByBarcode('000');

    expect(result).toBeNull();
  });

  it('propaga el error que tira el httpClient en otros status', async () => {
    mockedGet.mockRejectedValueOnce(new Error('boom server'));

    await expect(getProductByBarcode('779')).rejects.toThrow('boom server');
  });
});
