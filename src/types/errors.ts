/**
 * Error lanzado por el httpClient cuando la sesión expiró o es inválida.
 *
 * Los ViewModels pueden detectarlo con `instanceof AuthSessionExpiredError`
 * para evitar mostrar mensajes de error al usuario (el auth guard del
 * layout va a redirigir a /auth/login).
 */
export class AuthSessionExpiredError extends Error {
  constructor(message = 'Auth session expired') {
    super(message);
    this.name = 'AuthSessionExpiredError';
  }
}

export type UserFriendlyError = {
  title: string;
  message: string;
  actionLabel?: string;
  code: string;
};

export class NetworkError extends Error {
  constructor(message = 'Network error') {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Error de una respuesta HTTP no-OK del backend. Lleva el `status` de forma
 * estructurada (en vez de embebido en el mensaje) para que la traducción de
 * errores no dependa de parsear strings. `code` es el código opcional que
 * mande el backend en el body.
 */
export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}
