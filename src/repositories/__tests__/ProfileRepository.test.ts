import ProfileRepository from '../ProfileRepository';
import httpClient from '@/config/clients';
import { User } from '@/types/auth';

jest.mock('@/config/clients', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedGet = httpClient.get as jest.Mock;
const mockedPut = httpClient.put as jest.Mock;
const mockedDelete = httpClient.delete as jest.Mock;
const axiosResponse = <T>(data: T) => ({ data });

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
    mockedGet.mockResolvedValueOnce(axiosResponse(user));

    const result = await ProfileRepository.getProfile();

    expect(mockedGet).toHaveBeenCalledWith('/api/users/profile');
    expect(result).toEqual(user);
  });

  it('updateProfile hace PUT con el payload y devuelve el usuario actualizado', async () => {
    const updated = { ...user, full_name: 'Andrei V' };
    mockedPut.mockResolvedValueOnce(axiosResponse(updated));

    const result = await ProfileRepository.updateProfile({ full_name: 'Andrei V' });

    expect(mockedPut).toHaveBeenCalledWith('/api/users/profile', { full_name: 'Andrei V' });
    expect(result).toEqual(updated);
  });

  it('deleteProfile hace DELETE', async () => {
    mockedDelete.mockResolvedValueOnce(axiosResponse({}));

    await ProfileRepository.deleteProfile();

    expect(mockedDelete).toHaveBeenCalledWith('/api/users/profile');
  });
});
