import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuthContext } from '../AuthContext';
import AuthRepository from '@/repositories/AuthRepository';
import supabase from '@/config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authEvents } from '@/utils/authEvents';
import { User } from '@/types/auth';

jest.mock('@/i18n', () => ({ __esModule: true, default: { t: (key: string) => key } }));
jest.mock('@/repositories/AuthRepository', () => ({
  __esModule: true,
  default: {
    getStoredSession: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    loginWithGoogle: jest.fn(),
    resetPassword: jest.fn(),
    logout: jest.fn(),
    saveSession: jest.fn(),
    clearSession: jest.fn(),
  },
}));
jest.mock('@/config/supabase', () => ({ __esModule: true, default: { auth: { getUser: jest.fn() } } }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

const mockedAuthRepo = jest.mocked(AuthRepository);
const mockedGetUser = jest.mocked(supabase.auth.getUser);
const mockedGetItem = jest.mocked(AsyncStorage.getItem);

const user: User = {
  id: 'u1',
  email: 'andrei@uade.edu.ar',
  full_name: 'Andrei Veis',
  avatar_url: null,
  created_at: '2026-01-01T00:00:00Z',
};
const session = { token: 'tk', user };

const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;

const renderAuth = async () => {
  const utils = renderHook(() => useAuthContext(), { wrapper });
  await waitFor(() => expect(utils.result.current.isLoading).toBe(false));
  return utils;
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuthRepo.getStoredSession.mockResolvedValue(null);
    mockedAuthRepo.saveSession.mockResolvedValue(undefined);
    mockedAuthRepo.clearSession.mockResolvedValue(undefined);
  });

  describe('restauración de sesión', () => {
    it('sin sesión guardada queda no autenticado', async () => {
      const { result } = await renderAuth();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('con sesión válida restaura usuario y autentica', async () => {
      mockedAuthRepo.getStoredSession.mockResolvedValueOnce(session);
      mockedGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null } as never);

      const { result } = await renderAuth();

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.id).toBe('u1');
    });

    it('con token inválido limpia la sesión', async () => {
      mockedAuthRepo.getStoredSession.mockResolvedValueOnce(session);
      mockedGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'bad' } } as never);

      const { result } = await renderAuth();

      expect(result.current.isAuthenticated).toBe(false);
      expect(mockedAuthRepo.clearSession).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('login OK autentica y guarda sesión', async () => {
      mockedAuthRepo.login.mockResolvedValueOnce(session);
      const { result } = await renderAuth();

      await act(async () => {
        await result.current.login('andrei@uade.edu.ar', 'secret123');
      });

      expect(mockedAuthRepo.login).toHaveBeenCalledWith('andrei@uade.edu.ar', 'secret123');
      expect(mockedAuthRepo.saveSession).toHaveBeenCalledWith('tk', user);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('login con email inválido no llama al repo y setea error de email', async () => {
      const { result } = await renderAuth();

      await act(async () => {
        await expect(result.current.login('mal-email', 'secret123')).rejects.toMatchObject({ field: 'email' });
      });

      expect(mockedAuthRepo.login).not.toHaveBeenCalled();
      expect(result.current.error?.field).toBe('email');
    });

    it('login con error de backend mapea y re-lanza', async () => {
      mockedAuthRepo.login.mockRejectedValueOnce(new Error('Invalid login credentials'));
      const { result } = await renderAuth();

      await act(async () => {
        await expect(result.current.login('andrei@uade.edu.ar', 'x')).rejects.toMatchObject({
          message: 'auth.errors.invalidCredentials',
        });
      });

      expect(result.current.error?.message).toBe('auth.errors.invalidCredentials');
    });
  });

  describe('register', () => {
    it('register OK con credenciales válidas', async () => {
      mockedAuthRepo.register.mockResolvedValueOnce(session);
      const { result } = await renderAuth();

      await act(async () => {
        await result.current.register({
          full_name: 'Andrei Veis',
          email: 'andrei@uade.edu.ar',
          password: 'secret123',
          confirmPassword: 'secret123',
        });
      });

      expect(mockedAuthRepo.register).toHaveBeenCalledWith('Andrei Veis', 'andrei@uade.edu.ar', 'secret123');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('register con validación fallida no llama al repo', async () => {
      const { result } = await renderAuth();

      await act(async () => {
        await expect(
          result.current.register({ full_name: '', email: 'andrei@uade.edu.ar', password: 'secret123', confirmPassword: 'secret123' }),
        ).rejects.toMatchObject({ field: 'full_name' });
      });

      expect(mockedAuthRepo.register).not.toHaveBeenCalled();
    });
  });

  describe('otras acciones', () => {
    it('loginWithGoogle OK autentica', async () => {
      mockedAuthRepo.loginWithGoogle.mockResolvedValueOnce(session);
      const { result } = await renderAuth();

      await act(async () => {
        await result.current.loginWithGoogle();
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('resetPassword con email inválido devuelve false', async () => {
      const { result } = await renderAuth();

      let ok = true;
      await act(async () => {
        ok = await result.current.resetPassword('mal-email');
      });

      expect(ok).toBe(false);
      expect(result.current.error?.field).toBe('email');
    });

    it('resetPassword con email válido devuelve true', async () => {
      mockedAuthRepo.resetPassword.mockResolvedValueOnce(undefined);
      const { result } = await renderAuth();

      let ok = false;
      await act(async () => {
        ok = await result.current.resetPassword('andrei@uade.edu.ar');
      });

      expect(ok).toBe(true);
      expect(mockedAuthRepo.resetPassword).toHaveBeenCalledWith('andrei@uade.edu.ar');
    });

    it('logout limpia la sesión y desautentica', async () => {
      mockedAuthRepo.login.mockResolvedValueOnce(session);
      mockedAuthRepo.logout.mockResolvedValueOnce(undefined);
      const { result } = await renderAuth();
      await act(async () => {
        await result.current.login('andrei@uade.edu.ar', 'secret123');
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockedAuthRepo.clearSession).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('updateUser actualiza el usuario y persiste si hay token', async () => {
      mockedGetItem.mockResolvedValueOnce('tk');
      const { result } = await renderAuth();
      const updated = { ...user, full_name: 'Andrei V' };

      await act(async () => {
        await result.current.updateUser(updated);
      });

      expect(result.current.user).toEqual(updated);
      expect(mockedAuthRepo.saveSession).toHaveBeenCalledWith('tk', updated);
    });

    it('clearError limpia el error', async () => {
      const { result } = await renderAuth();
      await act(async () => {
        await expect(result.current.login('mal-email', 'x')).rejects.toBeTruthy();
      });
      expect(result.current.error).not.toBeNull();

      act(() => result.current.clearError());

      expect(result.current.error).toBeNull();
    });

    it('el evento sessionExpired limpia el estado local', async () => {
      mockedAuthRepo.login.mockResolvedValueOnce(session);
      const { result } = await renderAuth();
      await act(async () => {
        await result.current.login('andrei@uade.edu.ar', 'secret123');
      });
      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        authEvents.emitSessionExpired();
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it('useAuthContext fuera del provider lanza error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuthContext())).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });
});
