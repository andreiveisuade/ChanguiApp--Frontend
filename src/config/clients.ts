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

    const status = error.response.status;
    const data = error.response.data as { message?: string; error?: string } | undefined;
    // Si el backend manda un mensaje, lo respetamos. Si no (ej: 503 con body
    // vacío del cold start de Render), evitamos el técnico "Request failed
    // with status N" y mostramos algo entendible.
    const fallback =
      status === 503
        ? 'El servicio no está disponible. Reintentá en unos momentos.'
        : status >= 500
          ? 'Hubo un error en el servidor. Reintentá más tarde.'
          : `Request failed with status ${status}`;
    const message = data?.message ?? data?.error ?? fallback;
    // Adjuntamos el status como propiedad estructurada para que los consumidores
    // (ErrorTranslationService) no tengan que parsear el mensaje por regex.
    const httpError = new Error(message) as Error & { status?: number };
    httpError.status = status;
    throw httpError;
  },
);

export default httpClient;
