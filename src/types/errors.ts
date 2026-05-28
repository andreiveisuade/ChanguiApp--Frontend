/**
 * Error lanzado por apiFetch cuando la sesión expiró o es inválida.
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
