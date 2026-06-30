import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import AuthRepository from '@/repositories/AuthRepository';
import { authEvents } from '@/utils/authEvents';
import { ApiError, AuthSessionExpiredError, NetworkError } from '@/types/errors';
import { API_URL, API_TIMEOUT_MS } from '@/constants/api';
import { logger } from '@/utils/debugStore';

// Guarda el inicio de cada request para medir latencia en la respuesta.
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: { start: number };
  }
}

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

// `METHOD /ruta (123ms)` — etiqueta compacta de la request para los logs.
const trace = (config?: InternalAxiosRequestConfig): string => {
  const method = (config?.method ?? 'get').toUpperCase();
  const url = config?.url ?? '?';
  return `${method} ${url}`;
};

// Latencia de la request (ms) a partir del timestamp guardado en el interceptor.
const elapsedMs = (config?: InternalAxiosRequestConfig): number | undefined => {
  const start = config?.metadata?.start;
  return start != null ? Date.now() - start : undefined;
};

httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.metadata = { start: Date.now() };
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

// Toda request OK o con error pasa por acá y queda registrada en el debug
// overlay: así cualquier fallo de red es observable sin instrumentar cada hook.
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.call({
      source: 'http',
      message: `${response.status} ${trace(response.config)}`,
      durationMs: elapsedMs(response.config),
    });
    return response;
  },
  async (error: AxiosError) => {
    const where = trace(error.config);
    const durationMs = elapsedMs(error.config);

    if (!error.response) {
      logger.call({ source: 'http', level: 'error', message: `red caída ${where}`, durationMs });
      throw new NetworkError();
    }

    if (error.response.status === 401) {
      logger.call({
        source: 'http',
        level: 'error',
        message: `401 ${where} — sesión expirada`,
        durationMs,
      });
      await AuthRepository.clearSession();
      authEvents.emitSessionExpired();
      throw new AuthSessionExpiredError();
    }

    const status = error.response.status;
    const data = error.response.data as
      | { message?: string; error?: string; code?: string }
      | undefined;
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
    logger.call({
      source: 'http',
      level: 'error',
      message: `${status} ${where} — ${message}`,
      durationMs,
    });
    throw new ApiError(status, message, data?.code);
  },
);

export default httpClient;
