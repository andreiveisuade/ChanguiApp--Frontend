/**
 * Helper fetch authenticated para los repositories.
 *
 * Centraliza:
 * - Lectura del bearer token de la sesión guardada
 * - Inyección del header Authorization
 * - Detección de 401: limpia sesión local y emite evento para que el
 *   AuthContext actualice estado → el guard del tabs layout redirige a login
 * - Tipado de error de sesión expirada (AuthSessionExpiredError)
 *
 * Los repositories que pegan al backend autenticado deben usar este helper
 * en lugar de fetch directo.
 */

import AuthRepository from '@/repositories/AuthRepository';
import { authEvents } from '@/utils/authEvents';
import { AuthSessionExpiredError } from '@/types/errors';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://changuiapp-backend.onrender.com';

export interface ApiFetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
}

/**
 * Disparado cuando no hay sesión guardada o el backend responde 401.
 * Limpia el storage y notifica a los listeners (AuthContext).
 */
async function handleSessionExpired(): Promise<never> {
  await AuthRepository.clearSession();
  authEvents.emitSessionExpired();
  throw new AuthSessionExpiredError();
}

/**
 * Fetch authenticated contra el backend.
 *
 * @param path - Path relativo a la API (ej: '/api/cart')
 * @param options - Opciones estándar de fetch
 * @throws AuthSessionExpiredError si no hay sesión o el backend responde 401
 * @throws Error con el mensaje del backend para otros errores no-OK
 */
export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const session = await AuthRepository.getStoredSession();
  if (!session) {
    return handleSessionExpired();
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401) {
    return handleSessionExpired();
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData.message === 'string') {
        message = errorData.message;
      } else if (errorData && typeof errorData.error === 'string') {
        message = errorData.error;
      }
    } catch {
      // Body no es JSON — usar mensaje por defecto
    }
    throw new Error(message);
  }

  return response;
}
