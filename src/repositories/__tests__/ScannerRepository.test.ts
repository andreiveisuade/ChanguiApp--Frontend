import { getProductByBarcode } from '../ScannerRepository';
import AuthRepository from '@/repositories/AuthRepository';

jest.mock('@/repositories/AuthRepository', () => ({
  __esModule: true,
  default: { getStoredSession: jest.fn() },
}));

const mockedGetSession = jest.mocked(AuthRepository.getStoredSession);

describe('ScannerRepository.getProductByBarcode', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock as unknown as typeof fetch;
    mockedGetSession.mockResolvedValue({
      token: 'tk',
      user: { id: 'u1', email: 'a@b.com', full_name: 'A', avatar_url: null, created_at: '2026-01-01' },
    });
  });

  it('devuelve el producto y manda el header Authorization con el token', async () => {
    const product = { id: 'p1', name: 'Yerba', barcode: '779', brand: 'Playadito', image_url: null, price: 1000 };
    fetchMock.mockResolvedValueOnce({ status: 200, ok: true, json: async () => product });

    const result = await getProductByBarcode('779');

    expect(result).toEqual(product);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/products/barcode/779');
    expect(opts.headers.Authorization).toBe('Bearer tk');
  });

  it('devuelve null en 404 (código no está en el catálogo)', async () => {
    fetchMock.mockResolvedValueOnce({ status: 404, ok: false, json: async () => ({}) });

    const result = await getProductByBarcode('000');

    expect(result).toBeNull();
  });

  it('lanza el mensaje del backend en error no-OK', async () => {
    fetchMock.mockResolvedValueOnce({ status: 500, ok: false, json: async () => ({ message: 'boom server' }) });

    await expect(getProductByBarcode('779')).rejects.toThrow('boom server');
  });

  it('usa errorData.error cuando el body no trae message', async () => {
    fetchMock.mockResolvedValueOnce({ status: 500, ok: false, json: async () => ({ error: 'campo error' }) });

    await expect(getProductByBarcode('779')).rejects.toThrow('campo error');
  });

  it('usa el mensaje default cuando el body no es JSON', async () => {
    fetchMock.mockResolvedValueOnce({
      status: 503,
      ok: false,
      json: async () => {
        throw new Error('not json');
      },
    });

    await expect(getProductByBarcode('779')).rejects.toThrow('Product lookup failed: status 503');
  });

  it('traduce AbortError a network timeout', async () => {
    const abort = new Error('aborted');
    abort.name = 'AbortError';
    fetchMock.mockRejectedValueOnce(abort);

    await expect(getProductByBarcode('779')).rejects.toThrow('network timeout');
  });

  it('funciona sin sesión guardada (sin header Authorization)', async () => {
    mockedGetSession.mockResolvedValueOnce(null);
    const product = { id: 'p1', name: 'Yerba', barcode: '779', brand: null, image_url: null, price: 1000 };
    fetchMock.mockResolvedValueOnce({ status: 200, ok: true, json: async () => product });

    await getProductByBarcode('779');

    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.headers.Authorization).toBeUndefined();
  });
});
