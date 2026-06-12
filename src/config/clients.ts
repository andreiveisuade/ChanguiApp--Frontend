import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AuthRepository from '@/repositories/AuthRepository';
import { authEvents } from '@/utils/authEvents';
import { AuthSessionExpiredError, NetworkError } from '@/types/errors';
import { API_URL, API_TIMEOUT_MS } from '@/constants/api';

const httpClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cliente axios para login/register: sin el interceptor de sesión, porque en
// esos endpoints todavía no hay token. Comparte baseURL y timeout.
export const authClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await AuthRepository.getStoredSession();
    if (!session) {
      authEvents.emitSessionExpired();
      throw new AuthSessionExpiredError();
    }
    config.headers.Authorization = `Bearer ${session.token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.response) {
      throw new NetworkError();
    }

    if (error.response.status === 401) {
      await AuthRepository.clearSession();
      authEvents.emitSessionExpired();
      throw new AuthSessionExpiredError();
    }

    const data = error.response.data as { message?: string; error?: string } | undefined;
    const message =
      data?.message ??
      data?.error ??
      `Request failed with status ${error.response.status}`;
    throw new Error(message);
  },
);

export default httpClient;
