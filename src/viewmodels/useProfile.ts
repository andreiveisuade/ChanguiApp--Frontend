import { useCallback, useEffect, useState } from 'react';
import ProfileRepository, { UpdateProfilePayload } from '@/repositories/ProfileRepository';
import { AuthSessionExpiredError } from '@/types/errors';
import { User } from '@/types/auth';
import useAuth from '@/viewmodels/useAuth';

export type ProfileError = {
  message: string;
};

export type UseProfileReturn = {
  profile: User | null;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: ProfileError | null;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  deleteProfile: () => Promise<void>;
  clearError: () => void;
};

export const useProfile = (): UseProfileReturn => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<ProfileError | null>(null);

  const fetchProfile = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ProfileRepository.getProfile();
      setProfile(data);
    } catch (err) {
      // 401 / sesion invalida: el httpClient ya limpio el storage y emitio el evento.
      // El AuthContext va a limpiar estado y el guard del tabs layout redirige a login.
      if (err instanceof AuthSessionExpiredError) {
        return;
      }
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError({ message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<void> => {
      setIsSaving(true);
      setError(null);
      try {
        const data = await ProfileRepository.updateProfile(payload);
        setProfile(data);
        await updateUser(data);
      } catch (err) {
        if (err instanceof AuthSessionExpiredError) return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError({ message });
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [updateUser],
  );

  const deleteProfile = useCallback(async (): Promise<void> => {
    setIsDeleting(true);
    setError(null);
    try {
      await ProfileRepository.deleteProfile();
      setProfile(null);
    } catch (err) {
      if (err instanceof AuthSessionExpiredError) return;
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError({ message });
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    profile,
    isLoading,
    isSaving,
    isDeleting,
    error,
    updateProfile,
    deleteProfile,
    clearError,
  };
};

export default useProfile;
