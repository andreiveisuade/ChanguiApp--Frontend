import ProfileRepository from '../ProfileRepository';
import { apiFetch } from '@/utils/apiFetch';
import { User } from '@/types/auth';

jest.mock('@/utils/apiFetch', () => ({ apiFetch: jest.fn() }));

const mockedFetch = jest.mocked(apiFetch);
const jsonResponse = (data: unknown) => ({ json: async () => data }) as Response;

const user: User = {
  id: 'u1',
  email: 'andrei@uade.edu.ar',
  full_name: 'Andrei Veis',
  avatar_url: null,
  created_at: '2026-01-01T00:00:00Z',
};

describe('ProfileRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getProfile hace GET al perfil y devuelve el usuario', async () => {
    mockedFetch.mockResolvedValueOnce(jsonResponse(user));

    const result = await ProfileRepository.getProfile();

    expect(mockedFetch).toHaveBeenCalledWith('/api/users/profile');
    expect(result).toEqual(user);
  });

  it('updateProfile hace PUT con el payload y devuelve el usuario actualizado', async () => {
    const updated = { ...user, full_name: 'Andrei V' };
    mockedFetch.mockResolvedValueOnce(jsonResponse(updated));

    const result = await ProfileRepository.updateProfile({ full_name: 'Andrei V' });

    expect(mockedFetch).toHaveBeenCalledWith('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ full_name: 'Andrei V' }),
    });
    expect(result).toEqual(updated);
  });

  it('deleteProfile hace DELETE', async () => {
    mockedFetch.mockResolvedValueOnce(jsonResponse({}));

    await ProfileRepository.deleteProfile();

    expect(mockedFetch).toHaveBeenCalledWith('/api/users/profile', { method: 'DELETE' });
  });
});
