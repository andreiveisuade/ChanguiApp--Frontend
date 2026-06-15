import { apiFetch } from '../apiFetch';
import AuthRepository from '@/repositories/AuthRepository';
import { authEvents } from '@/utils/authEvents';
import { AuthSessionExpiredError, NetworkError } from '@/types/errors';

jest.mock('@/repositories/AuthRepository', () => ({
  __esModule: true,
  default: { getStoredSession: jest.fn(), clearSession: jest.fn() },
}));

const mockedGetSession = jest.mocked(AuthRepository.getStoredSession);
const mockedClearSession = jest.mocked(AuthRepository.clearSession);
const fetchMock = jest.fn();

const validSession = {
  token: 'tk',
  user: { id: 'u1', email: 'a@b.com', full_name: 'A', avatar_url: null, created_at: '2026-01-01' },
};

describe('apiFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock as unknown as typeof fetch;
    mockedGetSession.mockResolvedValue(validSession);
  });

  it('inyecta Authorization + Content-Type y devuelve la response en 2xx', async () => {
    const response = { ok: true, status: 200 };
    fetchMock.mockResolvedValueOnce(response);

    const result = await apiFetch('/api/cart');

    expect(result).toBe(response);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/cart');
    expect(opts.headers.Authorization).toBe('Bearer tk');
    expect(opts.headers['Content-Type']).toBe('application/json');
  });

  it('respeta el método y mergea headers custom', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200 });

    await apiFetch('/api/x', { method: 'POST', headers: { 'X-Custom': '1' } });

    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe('POST');
    expect(opts.headers['X-Custom']).toBe('1');
  });

  it('sin sesión: limpia storage, emite sessionExpired y lanza AuthSessionExpiredError sin pegarle al backend', async () => {
    mockedGetSession.mockResolvedValueOnce(null);
    const emitSpy = jest.spyOn(authEvents, 'emitSessionExpired');

    await expect(apiFetch('/api/cart')).rejects.toBeInstanceOf(AuthSessionExpiredError);

    expect(mockedClearSession).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
    emitSpy.mockRestore();
  });

  it('401: limpia la sesión y lanza AuthSessionExpiredError', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401 });

    await expect(apiFetch('/api/cart')).rejects.toBeInstanceOf(AuthSessionExpiredError);
    expect(mockedClearSession).toHaveBeenCalledTimes(1);
  });

  it('cuando fetch lanza (red caída): lanza NetworkError', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(apiFetch('/api/cart')).rejects.toBeInstanceOf(NetworkError);
  });

  it('no-OK: usa el message del backend', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'server msg' }),
    });

    await expect(apiFetch('/api/cart')).rejects.toThrow('server msg');
  });

  it('no-OK: cae al campo error si no hay message', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'bad request' }),
    });

    await expect(apiFetch('/api/cart')).rejects.toThrow('bad request');
  });

  it('no-OK con body no-JSON: mensaje default con el status', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => {
        throw new Error('not json');
      },
    });

    await expect(apiFetch('/api/cart')).rejects.toThrow('Request failed with status 503');
  });
});
