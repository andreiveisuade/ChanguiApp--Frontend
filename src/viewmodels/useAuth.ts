import { useCallback, useEffect, useMemo, useState } from 'react';
import i18n from '@/i18n';
import supabase from '@/config/supabase';
import AuthRepository from '@/repositories/AuthRepository';
import { AuthError, RegisterCredentials, User } from '@/types/auth';
import { mapAuthError } from '@/utils/authErrors';
import {
  doPasswordsMatch,
  isValidEmail,
  isValidFullName,
  isValidPassword,
} from '@/utils/validators';

type UseAuthReturn = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  login: (email: string, password: string) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const validateRegisterCredentials = (credentials: RegisterCredentials): AuthError | null => {
  if (!isValidFullName(credentials.full_name)) {
    return { message: i18n.t('auth.errors.nameTooShort'), field: 'full_name' };
  }

  if (!isValidEmail(credentials.email)) {
    return { message: i18n.t('auth.errors.invalidEmail'), field: 'email' };
  }

  if (!isValidPassword(credentials.password)) {
    return {
      message: i18n.t('auth.errors.passwordTooShort'),
      field: 'password',
    };
  }

  if (!doPasswordsMatch(credentials.password, credentials.confirmPassword)) {
    return { message: i18n.t('auth.errors.passwordMismatch'), field: 'confirmPassword' };
  }

  return null;
};

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);

  const isAuthenticated = useMemo(() => Boolean(user && token), [user, token]);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const setSession = useCallback(async (nextToken: string, nextUser: User): Promise<void> => {
    await AuthRepository.saveSession(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async (): Promise<void> => {
      setIsLoading(true);

      try {
        const storedSession = await AuthRepository.getStoredSession();

        if (!storedSession) {
          return;
        }

        const { data, error: userError } = await supabase.auth.getUser(storedSession.token);

        if (userError || !data.user) {
          await AuthRepository.clearSession();
          return;
        }

        if (isMounted) {
          setToken(storedSession.token);
          setUser(storedSession.user);
        }
      } catch {
        await AuthRepository.clearSession();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!isValidEmail(email)) {
          throw new Error('invalid email');
        }

        const session = await AuthRepository.login(email.trim(), password);
        await setSession(session.token, session.user);
      } catch (loginError) {
        const mappedError =
          loginError instanceof Error && loginError.message === 'invalid email'
            ? { message: i18n.t('auth.errors.invalidEmail'), field: 'email' as const }
            : mapAuthError(loginError);
        setError(mappedError);
        throw mappedError;
      } finally {
        setIsLoading(false);
      }
    },
    [setSession],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const validationError = validateRegisterCredentials(credentials);

        if (validationError) {
          throw validationError;
        }

        const session = await AuthRepository.register(
          credentials.full_name.trim(),
          credentials.email.trim(),
          credentials.password,
        );
        await setSession(session.token, session.user);
      } catch (registerError) {
        const mappedError =
          typeof registerError === 'object' &&
          registerError !== null &&
          'field' in registerError &&
          'message' in registerError
            ? (registerError as AuthError)
            : mapAuthError(registerError);
        setError(mappedError);
        throw mappedError;
      } finally {
        setIsLoading(false);
      }
    },
    [setSession],
  );

  const loginWithGoogle = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await AuthRepository.loginWithGoogle();
      await setSession(session.token, session.user);
    } catch (googleError) {
      const mappedError = mapAuthError(googleError);
      setError(mappedError);
      throw mappedError;
    } finally {
      setIsLoading(false);
    }
  }, [setSession]);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    if (!isValidEmail(email)) {
      setError({ message: i18n.t('auth.errors.invalidEmail'), field: 'email' });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await AuthRepository.resetPassword(email.trim());
    } catch {
      // Error silenciado intencionalmente — no revelar si el email existe
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthRepository.logout();
    } finally {
      await AuthRepository.clearSession();
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    loginWithGoogle,
    resetPassword,
    logout,
    clearError,
  };
};

export default useAuth;
