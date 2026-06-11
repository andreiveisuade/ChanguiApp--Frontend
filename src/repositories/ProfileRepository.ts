import httpClient from '@/config/clients';
import { User } from '@/types/auth';

export type UpdateProfilePayload = {
  full_name?: string;
  avatar_url?: string | null;
};

const ProfileRepository = {
  /**
   * Obtiene el perfil del usuario autenticado.
   * Auth (bearer token) y manejo de 401 lo cubre el httpClient.
   */
  async getProfile(): Promise<User> {
    const { data } = await httpClient.get<User>('/api/users/profile');
    return data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await httpClient.put<User>('/api/users/profile', payload);
    return data;
  },

  async deleteProfile(): Promise<void> {
    await httpClient.delete('/api/users/profile');
  },
};

export default ProfileRepository;
