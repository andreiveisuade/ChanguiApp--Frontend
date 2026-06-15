import AuthRepository from '../AuthRepository';
import supabase from '@/config/supabase';
import { authClient } from '@/config/clients';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { STORAGE_KEYS } from '@/constants/storage';

jest.mock('@/config/clients', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
  authClient: { post: jest.fn() },
}));

jest.mock('@/config/supabase', () => ({
  __esModule: true,
  default: {
    auth: {
      signInWithOAuth: jest.fn(),
      exchangeCodeForSession: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

jest.mock('expo-auth-session', () => ({ makeRedirectUri: jest.fn(() => 'changuiapp://redirect') }));
jest.mock('expo-linking', () => ({
  parse: jest.fn(),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

const mockedPost = authClient.post as jest.Mock;
const mockedGetItem = jest.mocked(AsyncStorage.getItem);
const mockedSetItem = jest.mocked(AsyncStorage.setItem);
const mockedRemoveItem = jest.mocked(AsyncStorage.removeItem);
const mockedSignInOAuth = jest.mocked(supabase.auth.signInWithOAuth);
const mockedExchange = jest.mocked(supabase.auth.exchangeCodeForSession);
const mockedResetPwd = jest.mocked(supabase.auth.resetPasswordForEmail);
const mockedSignOut = jest.mocked(supabase.auth.signOut);
const mockedParse = jest.mocked(Linking.parse);
const mockedOpenAuth = jest.mocked(WebBrowser.openAuthSessionAsync);

describe('AuthRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login / register', () => {
    it('login: POST /api/auth/login y normaliza token + user', async () => {
      mockedPost.mockResolvedValueOnce({
        data: { token: 'tk', user: { id: 'u1', email: 'a@b.com', full_name: 'Andrei' } },
      });

      const result = await AuthRepository.login('a@b.com', 'secret123');

      expect(mockedPost).toHaveBeenCalledWith('/api/auth/login', {
        email: 'a@b.com',
        password: 'secret123',
      });
      expect(result.token).toBe('tk');
      expect(result.user).toEqual({
        id: 'u1',
        email: 'a@b.com',
        full_name: 'Andrei',
        avatar_url: null,
        created_at: expect.any(String),
      });
    });

    it('register: manda name (no full_name) al backend', async () => {
      mockedPost.mockResolvedValueOnce({
        data: { token: 'tk', user: { id: 'u1', email: 'a@b.com', full_name: 'Andrei' } },
      });

      await AuthRepository.register('Andrei Veis', 'a@b.com', 'secret123');

      expect(mockedPost).toHaveBeenCalledWith('/api/auth/register', {
        name: 'Andrei Veis',
        email: 'a@b.com',
        password: 'secret123',
      });
    });

    it('lanza el mensaje del backend en respuesta no-OK', async () => {
      mockedPost.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 401, data: { message: 'credenciales inválidas' } },
      });

      await expect(AuthRepository.login('a@b.com', 'x')).rejects.toThrow('credenciales inválidas');
    });

    it('extrae el msg de validación de express-validator ({errors:[...]})', async () => {
      mockedPost.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            errors: [{ msg: 'La password debe tener al menos 6 caracteres', path: 'password' }],
          },
        },
      });

      await expect(AuthRepository.login('a@b.com', 'x')).rejects.toThrow(
        'La password debe tener al menos 6 caracteres',
      );
    });

    it('traduce error de red (sin respuesta) a network timeout', async () => {
      mockedPost.mockRejectedValueOnce({ isAxiosError: true, request: {}, response: undefined });

      await expect(AuthRepository.login('a@b.com', 'x')).rejects.toThrow('network timeout');
    });

    it('preserva el status HTTP en el error lanzado', async () => {
      mockedPost.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 503, data: undefined },
      });

      await expect(AuthRepository.login('a@b.com', 'x')).rejects.toMatchObject({ status: 503 });
    });

    it('toma email/full_name desde user_metadata si faltan en la raíz', async () => {
      mockedPost.mockResolvedValueOnce({
        data: {
          token: 'tk',
          user: { id: 'u1', user_metadata: { email: 'meta@b.com', name: 'Meta User' } },
        },
      });

      const result = await AuthRepository.login('a@b.com', 'x');

      expect(result.user.email).toBe('meta@b.com');
      expect(result.user.full_name).toBe('Meta User');
    });

    it('lanza si la respuesta no trae token', async () => {
      mockedPost.mockResolvedValueOnce({ data: { user: { id: 'u1', email: 'a@b.com' } } });

      await expect(AuthRepository.login('a@b.com', 'x')).rejects.toThrow('Invalid auth token');
    });

    it('lanza si el user no tiene email', async () => {
      mockedPost.mockResolvedValueOnce({ data: { token: 'tk', user: { id: 'u1' } } });

      await expect(AuthRepository.login('a@b.com', 'x')).rejects.toThrow('Invalid user response');
    });
  });

  describe('loginWithGoogle', () => {
    it('flujo OK: OAuth → browser success → exchange → token + user', async () => {
      mockedSignInOAuth.mockResolvedValueOnce({
        data: { url: 'https://google/oauth', provider: 'google' },
        error: null,
      } as never);
      mockedOpenAuth.mockResolvedValueOnce({
        type: 'success',
        url: 'changuiapp://redirect?code=abc',
      } as never);
      mockedParse.mockReturnValueOnce({ queryParams: { code: 'abc' } } as never);
      mockedExchange.mockResolvedValueOnce({
        data: {
          session: { access_token: 'tk' },
          user: { id: 'u1', email: 'a@b.com', full_name: 'Andrei' },
        },
        error: null,
      } as never);

      const result = await AuthRepository.loginWithGoogle();

      expect(result.token).toBe('tk');
      expect(result.user.id).toBe('u1');
    });

    it('lanza si el usuario cancela el browser', async () => {
      jest.useFakeTimers();
      mockedSignInOAuth.mockResolvedValueOnce({
        data: { url: 'https://google/oauth' },
        error: null,
      } as never);
      mockedOpenAuth.mockResolvedValueOnce({ type: 'cancel' } as never);

      const assertion = expect(AuthRepository.loginWithGoogle()).rejects.toThrow(
        'Google OAuth cancelled',
      );
      await jest.advanceTimersByTimeAsync(2000);
      await assertion;
      jest.useRealTimers();
    });

    it('lanza el error de supabase en signInWithOAuth', async () => {
      mockedSignInOAuth.mockResolvedValueOnce({
        data: {},
        error: new Error('oauth fail'),
      } as never);

      await expect(AuthRepository.loginWithGoogle()).rejects.toThrow('oauth fail');
    });

    it('lanza si supabase no devuelve la URL de OAuth', async () => {
      mockedSignInOAuth.mockResolvedValueOnce({ data: { url: null }, error: null } as never);

      await expect(AuthRepository.loginWithGoogle()).rejects.toThrow('Google OAuth URL missing');
    });

    it('lanza si el redirect no trae el code', async () => {
      mockedSignInOAuth.mockResolvedValueOnce({
        data: { url: 'https://google/oauth' },
        error: null,
      } as never);
      mockedOpenAuth.mockResolvedValueOnce({
        type: 'success',
        url: 'changuiapp://redirect',
      } as never);
      mockedParse.mockReturnValueOnce({ queryParams: {} } as never);

      await expect(AuthRepository.loginWithGoogle()).rejects.toThrow('Google OAuth code missing');
    });
  });

  describe('resetPassword / logout', () => {
    it('resetPassword llama a supabase', async () => {
      mockedResetPwd.mockResolvedValueOnce({ data: {}, error: null } as never);

      await AuthRepository.resetPassword('a@b.com');

      expect(mockedResetPwd).toHaveBeenCalledWith(
        'a@b.com',
        expect.objectContaining({ redirectTo: expect.any(String) }),
      );
    });

    it('logout lanza si supabase devuelve error', async () => {
      mockedSignOut.mockResolvedValueOnce({ error: new Error('signout fail') } as never);

      await expect(AuthRepository.logout()).rejects.toThrow('signout fail');
    });
  });

  describe('sesión en AsyncStorage', () => {
    it('getStoredSession devuelve token + user parseado', async () => {
      const storedUser = {
        id: 'u1',
        email: 'a@b.com',
        full_name: 'Andrei',
        avatar_url: null,
        created_at: '2026-01-01',
      };
      mockedGetItem.mockResolvedValueOnce('tk').mockResolvedValueOnce(JSON.stringify(storedUser));

      const result = await AuthRepository.getStoredSession();

      expect(result?.token).toBe('tk');
      expect(result?.user.id).toBe('u1');
    });

    it('getStoredSession limpia y devuelve null si el estado es inconsistente', async () => {
      mockedGetItem.mockResolvedValueOnce('tk').mockResolvedValueOnce(null);

      const result = await AuthRepository.getStoredSession();

      expect(result).toBeNull();
      expect(mockedRemoveItem).toHaveBeenCalled();
    });

    it('getStoredSession devuelve null y limpia si el JSON está corrupto', async () => {
      mockedGetItem.mockResolvedValueOnce('tk').mockResolvedValueOnce('{no-json');

      const result = await AuthRepository.getStoredSession();

      expect(result).toBeNull();
      expect(mockedRemoveItem).toHaveBeenCalled();
    });

    it('saveSession persiste token y user', async () => {
      await AuthRepository.saveSession('tk', {
        id: 'u1',
        email: 'a@b.com',
        full_name: 'A',
        avatar_url: null,
        created_at: '2026-01-01',
      });

      expect(mockedSetItem).toHaveBeenCalledWith(STORAGE_KEYS.token, 'tk');
      expect(mockedSetItem).toHaveBeenCalledWith(STORAGE_KEYS.user, expect.stringContaining('u1'));
    });

    it('clearSession borra ambas keys', async () => {
      await AuthRepository.clearSession();

      expect(mockedRemoveItem).toHaveBeenCalledWith(STORAGE_KEYS.token);
      expect(mockedRemoveItem).toHaveBeenCalledWith(STORAGE_KEYS.user);
    });
  });
});
