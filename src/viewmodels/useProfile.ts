import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProfileRepository, { UpdateProfilePayload } from '@/repositories/profileRepository';
import { User } from '@/types/auth';

type ProfileError = {
  message: string;
};

type UseProfileReturn = {
  profile: User | null;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: ProfileError | null;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  deleteProfile: () => Promise<void>;
  clearError: () => void;
};

export const useProfile = (token: string, onLogout: () => Promise<void>): UseProfileReturn => {
  const { t } = useTranslation();

  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<ProfileError | null>(null);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // READ
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await ProfileRepository.getProfile(token);
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        if (isMounted) {
          setError({
            message: err instanceof Error ? err.message : t('profile.errors.fetch'),
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [token, t]);

  // UPDATE
  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<void> => {
      setIsSaving(true);
      setError(null);

      try {
        const updated = await ProfileRepository.updateProfile(token, payload);
        setProfile(updated);
      } catch (err) {
        const mapped = {
          message: err instanceof Error ? err.message : t('profile.errors.update'),
        };
        setError(mapped);
        throw mapped;
      } finally {
        setIsSaving(false);
      }
    },
    [token, t],
  );

  // DELETE
  const deleteProfile = useCallback(async (): Promise<void> => {
    setIsDeleting(true);
    setError(null);

    try {
      await ProfileRepository.deleteProfile(token);
      await onLogout();
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : t('profile.errors.delete'),
      });
      setIsDeleting(false);
      throw err;
    }
  }, [token, onLogout, t]);

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