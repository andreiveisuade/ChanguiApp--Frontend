import { useCallback, useState } from 'react';
import { AuthSessionExpiredError, UserFriendlyError } from '@/types/errors';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';

export type UseAsyncActionReturn = {
  isLoading: boolean;
  error: UserFriendlyError | null;
  setError: (error: UserFriendlyError | null) => void;
  setIsLoading: (loading: boolean) => void;
  run: <T>(fn: () => Promise<T>) => Promise<T | undefined>;
};

export const useAsyncAction = (initialLoading = false): UseAsyncActionReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<UserFriendlyError | null>(null);

  const run = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      // 401 / sesión inválida: el httpClient ya limpió el storage y emitió el evento.
      // El AuthContext limpia estado y el guard del tabs layout redirige a login.
      if (err instanceof AuthSessionExpiredError) {
        return undefined;
      }
      setError(ErrorTranslationService.translate(err));
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, setError, setIsLoading, run };
};

export default useAsyncAction;
