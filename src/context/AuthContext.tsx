/**
 * AuthContext — estado de autenticación compartido por toda la app.
 *
 * Centraliza la lógica que antes vivía en useAuth (estado local por hook):
 * - Restauración de sesión al iniciar (con validación contra Supabase)
 * - Login / register / loginWithGoogle / resetPassword / logout
 * - Escucha eventos de sesión expirada desde el httpClient (401 → clearSession)
 *
 * Los componentes consumen este estado via el hook useAuth (que es ahora
 * un wrapper de useContext). La API pública del hook no cambia.
 *
 * La lógica se descompone en hooks internos por concern (useAuthSession para
 * estado + ciclo de vida, useSignInMethods y useAccountActions para las
 * operaciones) y AuthProvider sólo ensambla el value del context.
 */

import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';
import i18n from '@/i18n';
import supabase from '@/config/supabase';
import AuthRepository from '@/repositories/AuthRepository';
import { AuthError, RegisterCredentials, User } from '@/types/auth';
import { mapAuthError } from '@/utils/authErrors';
import { authEvents } from '@/utils/authEvents';
import {
  doPasswordsMatch,
  isValidEmail,
  isValidFullName,
  isValidPassword,
} from '@/utils/validators';

export type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  login: (email: string, password: string) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (updatedUser: User) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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

/**
 * Estado de sesión + ciclo de vida. Provee los primitivos que consumen los
 * hooks de acciones (setSession/clearLocalSession/setters).
 */
type AuthSession = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  setUser: Dispatch<SetStateAction<User | null>>;
  setError: Dispatch<SetStateAction<AuthError | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setSession: (token: string, user: User) => Promise<void>;
  clearLocalSession: () => void;
  clearError: () => void;
};

/** Lee la sesión guardada y la valida contra Supabase. Limpia y devuelve null si es inválida. */
async function loadValidSession(): Promise<{ token: string; user: User } | null> {
  try {
    const stored = await AuthRepository.getStoredSession();
    if (!stored) {
      return null;
    }
    const { data, error } = await supabase.auth.getUser(stored.token);
    if (error || !data.user) {
      await AuthRepository.clearSession();
      return null;
    }
    return stored;
  } catch {
    await AuthRepository.clearSession();
    return null;
  }
}

function useAuthSession(): AuthSession {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);

  const isAuthenticated = useMemo(() => Boolean(user && token), [user, token]);

  const clearError = useCallback((): void => setError(null), []);

  const setSession = useCallback(async (nextToken: string, nextUser: User): Promise<void> => {
    await AuthRepository.saveSession(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const clearLocalSession = useCallback((): void => {
    setToken(null);
    setUser(null);
  }, []);

  // Restaurar sesión al iniciar la app
  useEffect(() => {
    let isMounted = true;

    void (async () => {
      setIsLoading(true);
      const restored = await loadValidSession();
      if (!isMounted) {
        return;
      }
      if (restored) {
        setToken(restored.token);
        setUser(restored.user);
      }
      setIsLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listener: cuando el httpClient detecta 401, limpia estado local.
  // El auth guard del tabs layout va a detectar !isAuthenticated y redirige.
  useEffect(() => {
    const unsubscribe = authEvents.onSessionExpired(() => {
      clearLocalSession();
    });
    return unsubscribe;
  }, [clearLocalSession]);

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    setUser,
    setError,
    setIsLoading,
    setSession,
    clearLocalSession,
    clearError,
  };
}

/** Formas de autenticar: todas crean sesión vía setSession al tener éxito. */
function useSignInMethods(session: AuthSession) {
  const { setSession, setError, setIsLoading } = session;

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!isValidEmail(email)) {
          throw new Error('invalid email');
        }

        const result = await AuthRepository.login(email.trim(), password);
        await setSession(result.token, result.user);
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
    [setSession, setError, setIsLoading],
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

        const result = await AuthRepository.register(
          credentials.full_name.trim(),
          credentials.email.trim(),
          credentials.password,
        );
        await setSession(result.token, result.user);
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
    [setSession, setError, setIsLoading],
  );

  const loginWithGoogle = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await AuthRepository.loginWithGoogle();
      await setSession(result.token, result.user);
    } catch (googleError) {
      const mappedError = mapAuthError(googleError);
      setError(mappedError);
      throw mappedError;
    } finally {
      setIsLoading(false);
    }
  }, [setSession, setError, setIsLoading]);

  return { login, register, loginWithGoogle };
}

/** Acciones que no crean una sesión nueva: reset, logout, update de perfil. */
function useAccountActions(session: AuthSession) {
  const { setUser, setError, setIsLoading, clearLocalSession } = session;

  const resetPassword = useCallback(
    async (email: string): Promise<boolean> => {
      if (!isValidEmail(email)) {
        setError({ message: i18n.t('auth.errors.invalidEmail'), field: 'email' });
        return false;
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
      return true;
    },
    [setError, setIsLoading],
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthRepository.logout();
    } finally {
      await AuthRepository.clearSession();
      clearLocalSession();
      setIsLoading(false);
    }
  }, [clearLocalSession, setError, setIsLoading]);

  const updateUser = useCallback(
    async (updatedUser: User): Promise<void> => {
      setUser(updatedUser);
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.token);
      if (storedToken) {
        await AuthRepository.saveSession(storedToken, updatedUser);
      }
    },
    [setUser],
  );

  return { resetPassword, logout, updateUser };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const session = useAuthSession();
  const { login, register, loginWithGoogle } = useSignInMethods(session);
  const { resetPassword, logout, updateUser } = useAccountActions(session);
  const { user, isLoading, isAuthenticated, error, clearError } = session;

  const value = useMemo<AuthContextValue>(
    () => ({
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
      updateUser,
    }),
    [
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
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
