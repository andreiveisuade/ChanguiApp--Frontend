import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProfile } from '../useProfile';
import { createQueryWrapper } from '@/test-utils/queryWrapper';
import ProfileRepository from '@/repositories/ProfileRepository';
import { AuthSessionExpiredError } from '@/types/errors';
import { User } from '@/types/auth';

jest.mock('@/repositories/ProfileRepository', () => ({
  __esModule: true,
  default: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    deleteProfile: jest.fn(),
  },
}));

const mockUpdateUser = jest.fn();
jest.mock('@/viewmodels/useAuth', () => ({
  __esModule: true,
  default: () => ({ updateUser: mockUpdateUser }),
}));

const mockedGetProfile = jest.mocked(ProfileRepository.getProfile);
const mockedUpdateProfile = jest.mocked(ProfileRepository.updateProfile);
const mockedDeleteProfile = jest.mocked(ProfileRepository.deleteProfile);

const user: User = {
  id: 'u1',
  email: 'andrei@uade.edu.ar',
  full_name: 'Andrei Veis',
  avatar_url: null,
  created_at: '2026-01-01T00:00:00Z',
};

describe('useProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetProfile.mockResolvedValue(user);
    mockedUpdateProfile.mockResolvedValue(user);
    mockedDeleteProfile.mockResolvedValue(undefined);
  });

  it('carga el perfil al montar', async () => {
    const { result } = renderHook(() => useProfile(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.profile).toEqual(user);
    expect(result.current.error).toBeNull();
  });

  it('error en la carga: expone el mensaje', async () => {
    mockedGetProfile.mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useProfile(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.error).toEqual({ message: 'boom' }));
  });

  it('sesión expirada en la carga: no expone error', async () => {
    mockedGetProfile.mockRejectedValueOnce(new AuthSessionExpiredError());
    const { result } = renderHook(() => useProfile(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
  });

  it('updateProfile guarda y sincroniza el usuario en el AuthContext', async () => {
    const updated: User = { ...user, full_name: 'Andrei V' };
    mockedUpdateProfile.mockResolvedValueOnce(updated);
    const { result } = renderHook(() => useProfile(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateProfile({ full_name: 'Andrei V' });
    });

    expect(mockedUpdateProfile).toHaveBeenCalledWith({ full_name: 'Andrei V' });
    await waitFor(() => expect(result.current.profile).toEqual(updated));
    expect(mockUpdateUser).toHaveBeenCalledWith(updated);
    expect(result.current.isSaving).toBe(false);
  });

  it('updateProfile con error: expone el error y re-lanza', async () => {
    mockedUpdateProfile.mockRejectedValueOnce(new Error('no se pudo'));
    const { result } = renderHook(() => useProfile(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.updateProfile({ full_name: 'X' })).rejects.toThrow('no se pudo');
    });

    expect(result.current.error).toEqual({ message: 'no se pudo' });
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('updateProfile con sesión expirada: no expone error ni re-lanza', async () => {
    mockedUpdateProfile.mockRejectedValueOnce(new AuthSessionExpiredError());
    const { result } = renderHook(() => useProfile(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.updateProfile({ full_name: 'X' })).resolves.toBeUndefined();
    });

    expect(result.current.error).toBeNull();
  });

  it('deleteProfile limpia el perfil', async () => {
    const { result } = renderHook(() => useProfile(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteProfile();
    });

    expect(mockedDeleteProfile).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.profile).toBeNull());
    expect(result.current.isDeleting).toBe(false);
  });

  it('deleteProfile con error: expone el error y re-lanza', async () => {
    mockedDeleteProfile.mockRejectedValueOnce(new Error('fallo borrar'));
    const { result } = renderHook(() => useProfile(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.deleteProfile()).rejects.toThrow('fallo borrar');
    });

    expect(result.current.error).toEqual({ message: 'fallo borrar' });
  });

  it('clearError limpia el error', async () => {
    mockedGetProfile.mockRejectedValueOnce(new Error('x'));
    const { result } = renderHook(() => useProfile(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.error).toEqual({ message: 'x' }));

    act(() => result.current.clearError());

    expect(result.current.error).toBeNull();
  });
});
