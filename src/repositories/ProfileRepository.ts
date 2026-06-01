import { apiFetch } from '@/utils/apiFetch';
import { User } from '@/types/auth';

export type UpdateProfilePayload = {
  full_name?: string;
  avatar_url?: string | null;
};

export const ProfileRepository = {
  /**
   * Obtiene el perfil del usuario autenticado.
   * Auth (bearer token) y manejo de 401 lo cubre apiFetch.
   */
  async getProfile(): Promise<User> {
    const response = await apiFetch('/api/users/profile');
    return response.json();
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await apiFetch('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  async deleteProfile(): Promise<void> {
    await apiFetch('/api/users/profile', { method: 'DELETE' });
  },
};

export default ProfileRepository;
