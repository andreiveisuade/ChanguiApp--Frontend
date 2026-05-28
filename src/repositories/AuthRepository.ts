import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import supabase from '@/config/supabase';
import { AuthSession as StoredAuthSession, User } from '@/types/auth';
import { API_URL, API_TIMEOUT_MS, DEEP_LINKS } from '@/constants/api';
import { STORAGE_KEYS } from '@/constants/storage';

WebBrowser.maybeCompleteAuthSession();

type ObjectRecord = Record<string, unknown>;

const isObjectRecord = (value: unknown): value is ObjectRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getString = (source: ObjectRecord, key: string): string | null =>
  typeof source[key] === 'string' ? source[key] : null;

const normalizeUser = (rawUser: unknown): User => {
  if (!isObjectRecord(rawUser)) {
    throw new Error('Invalid user response');
  }

  const metadata = isObjectRecord(rawUser.user_metadata) ? rawUser.user_metadata : {};
  const email = getString(rawUser, 'email') ?? getString(metadata, 'email');
  const fullName =
    getString(rawUser, 'full_name') ??
    getString(rawUser, 'fullName') ??
    getString(metadata, 'full_name') ??
    getString(metadata, 'name') ??
    '';

  const user: User = {
    id: getString(rawUser, 'id') ?? '',
    email: email ?? '',
    full_name: fullName,
    avatar_url:
      getString(rawUser, 'avatar_url') ??
      getString(rawUser, 'avatarUrl') ??
      getString(metadata, 'avatar_url'),
    created_at:
      getString(rawUser, 'created_at') ??
      getString(rawUser, 'createdAt') ??
      new Date().toISOString(),
  };

  if (!user.id || !user.email) {
    throw new Error('Invalid user response');
  }

  return user;
};

const normalizeAuthSession = (payload: unknown): StoredAuthSession => {
  if (!isObjectRecord(payload)) {
    throw new Error('Invalid auth response');
  }

  const data = isObjectRecord(payload.data) ? payload.data : payload;
  const session = isObjectRecord(data.session) ? data.session : data;
  const token =
    getString(data, 'token') ??
    getString(data, 'access_token') ??
    getString(data, 'accessToken') ??
    getString(session, 'access_token') ??
    getString(session, 'accessToken');

  if (!token) {
    throw new Error('Invalid auth token');
  }

  return {
    token,
    user: normalizeUser(data.user ?? session.user),
  };
};

const requestAuth = async (
  endpoint: 'login' | 'register',
  body: ObjectRecord,
): Promise<StoredAuthSession> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        isObjectRecord(payload) && typeof payload.message === 'string'
          ? payload.message
          : isObjectRecord(payload) && typeof payload.error === 'string'
            ? payload.error
            : 'Authentication request failed';
      throw new Error(errorMessage);
    }

    return normalizeAuthSession(payload);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('network timeout');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const AuthRepository = {
  login: (email: string, password: string): Promise<StoredAuthSession> =>
    requestAuth('login', { email, password }),

  register: (
    full_name: string,
    email: string,
    password: string,
  ): Promise<StoredAuthSession> => requestAuth('register', { name: full_name, email, password }),

  loginWithGoogle: async (): Promise<StoredAuthSession> => {
    const redirectTo = AuthSession.makeRedirectUri();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      throw error;
    }

    if (!data.url) {
      throw new Error('Google OAuth URL missing');
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type !== 'success') {
      throw new Error('Google OAuth cancelled');
    }

    const parsedUrl = Linking.parse(result.url);
    const code = typeof parsedUrl.queryParams?.code === 'string' ? parsedUrl.queryParams.code : null;

    if (!code) {
      throw new Error('Google OAuth code missing');
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(
      code,
    );

    if (sessionError) {
      throw sessionError;
    }

    if (!sessionData.session || !sessionData.user) {
      throw new Error('Google OAuth session missing');
    }

    return {
      token: sessionData.session.access_token,
      user: normalizeUser(sessionData.user),
    };
  },

  resetPassword: async (email: string): Promise<void> => {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: DEEP_LINKS.resetPassword,
    });
    // Supabase no revela si el email existe — siempre resuelve sin error
  },

  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  },

  getStoredSession: async (): Promise<StoredAuthSession | null> => {
    const [token, userJson] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.token),
      AsyncStorage.getItem(STORAGE_KEYS.user),
    ]);

    if (!token || !userJson) {
      // Estado inconsistente (solo una de las dos keys): limpiar para evitar zombies.
      if (token || userJson) {
        await AuthRepository.clearSession();
      }
      return null;
    }

    try {
      return {
        token,
        user: normalizeUser(JSON.parse(userJson) as unknown),
      };
    } catch {
      await AuthRepository.clearSession();
      return null;
    }
  },

  saveSession: async (token: string, user: User): Promise<void> => {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.token, token),
      AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user)),
    ]);
  },

  clearSession: async (): Promise<void> => {
    await Promise.all([AsyncStorage.removeItem(STORAGE_KEYS.token), AsyncStorage.removeItem(STORAGE_KEYS.user)]);
  },
};

export default AuthRepository;
