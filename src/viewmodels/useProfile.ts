import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [error, setError] = useState<ProfileError | null>(null);

  const query = useQuery({
    queryKey: ['profile'],
    queryFn: () => ProfileRepository.getProfile(),
  });

  // Error de carga → {message}, silenciando AuthSessionExpiredError (el AuthContext
  // ya limpió la sesión y dispara el redirect a login).
  useEffect(() => {
    if (!query.error || query.error instanceof AuthSessionExpiredError) {
      return;
    }
    const message = query.error instanceof Error ? query.error.message : 'Unknown error';
    setError({ message });
  }, [query.error]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => ProfileRepository.updateProfile(payload),
    onSuccess: async (data) => {
      queryClient.setQueryData(['profile'], data);
      await updateUser(data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => ProfileRepository.deleteProfile(),
    onSuccess: () => {
      queryClient.setQueryData(['profile'], null);
    },
  });

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<void> => {
      setError(null);
      try {
        await updateMutation.mutateAsync(payload);
      } catch (err) {
        if (err instanceof AuthSessionExpiredError) return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError({ message });
        throw err;
      }
    },
    [updateMutation],
  );

  const deleteProfile = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await deleteMutation.mutateAsync();
    } catch (err) {
      if (err instanceof AuthSessionExpiredError) return;
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError({ message });
      throw err;
    }
  }, [deleteMutation]);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    profile: query.data ?? null,
    isLoading: query.isPending,
    isSaving: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    error,
    updateProfile,
    deleteProfile,
    clearError,
  };
};

export default useProfile;
