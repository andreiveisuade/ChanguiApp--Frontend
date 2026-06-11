import httpClient from '../clients';
import AuthRepository from '@/repositories/AuthRepository';
import { authEvents } from '@/utils/authEvents';
import { AuthSessionExpiredError, NetworkError } from '@/types/errors';

jest.mock('@/repositories/AuthRepository', () => ({
  __esModule: true,
  default: { getStoredSession: jest.fn(), clearSession: jest.fn() },
}));

const mockedGetSession = jest.mocked(AuthRepository.getStoredSession);
const mockedClearSession = jest.mocked(AuthRepository.clearSession);

// Handlers internos de los interceptores: los probamos directo, sin pegarle a la red.
const requestFulfilled = (httpClient.interceptors.request as unknown as {
  handlers: { fulfilled: (config: { headers: Record<string, string> }) => Promise<{ headers: Record<string, string> }> }[];
}).handlers[0].fulfilled;

const responseRejected = (httpClient.interceptors.response as unknown as {
  handlers: { rejected: (error: unknown) => Promise<never> }[];
}).handlers[0].rejected;

const validSession = {
  token: 'tk',
  user: { id: 'u1', email: 'a@b.com', full_name: 'A', avatar_url: null, created_at: '2026-01-01' },
};

describe('httpClient interceptors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetSession.mockResolvedValue(validSession);
  });

  describe('request', () => {
    it('inyecta el header Authorization con el token de la sesión', async () => {
      const config = await requestFulfilled({ headers: {} });

      expect(config.headers.Authorization).toBe('Bearer tk');
    });

    it('sin sesión: emite sessionExpired y lanza AuthSessionExpiredError sin pegarle al backend', async () => {
      mockedGetSession.mockResolvedValueOnce(null);
      const emitSpy = jest.spyOn(authEvents, 'emitSessionExpired');

      await expect(requestFulfilled({ headers: {} })).rejects.toBeInstanceOf(AuthSessionExpiredError);
      expect(emitSpy).toHaveBeenCalledTimes(1);
      emitSpy.mockRestore();
    });
  });

  describe('response', () => {
    it('401: limpia la sesión, emite sessionExpired y lanza AuthSessionExpiredError', async () => {
      const emitSpy = jest.spyOn(authEvents, 'emitSessionExpired');

      await expect(responseRejected({ response: { status: 401, data: {} } })).rejects.toBeInstanceOf(
        AuthSessionExpiredError,
      );
      expect(mockedClearSession).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledTimes(1);
      emitSpy.mockRestore();
    });

    it('sin response (red caída): lanza NetworkError', async () => {
      await expect(responseRejected({ request: {} })).rejects.toBeInstanceOf(NetworkError);
    });

    it('usa el message del backend', async () => {
      await expect(
        responseRejected({ response: { status: 500, data: { message: 'server msg' } } }),
      ).rejects.toThrow('server msg');
    });

    it('cae al campo error si no hay message', async () => {
      await expect(
        responseRejected({ response: { status: 400, data: { error: 'bad request' } } }),
      ).rejects.toThrow('bad request');
    });

    it('fallback al status cuando el body no trae message ni error', async () => {
      await expect(
        responseRejected({ response: { status: 503, data: {} } }),
      ).rejects.toThrow('Request failed with status 503');
    });
  });
});
