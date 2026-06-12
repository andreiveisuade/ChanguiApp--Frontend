jest.mock('@/i18n', () => ({ __esModule: true, default: { t: (key: string) => key } }));

import { mapAuthError } from '../authErrors';

describe('mapAuthError', () => {
  it('detecta email ya registrado y apunta al campo email', () => {
    expect(mapAuthError(new Error('User already registered'))).toEqual({
      message: 'auth.errors.emailAlreadyUsed',
      field: 'email',
    });
    expect(mapAuthError(new Error('email already exists')).field).toBe('email');
  });

  it('detecta credenciales inválidas con field general', () => {
    expect(mapAuthError(new Error('Invalid login credentials'))).toEqual({
      message: 'auth.errors.invalidCredentials',
      field: 'general',
    });
    expect(mapAuthError(new Error('Unauthorized')).message).toBe('auth.errors.invalidCredentials');
  });

  it('detecta errores de red', () => {
    expect(mapAuthError(new Error('network timeout')).message).toBe('auth.errors.networkError');
    expect(mapAuthError(new Error('Failed to fetch')).message).toBe('auth.errors.networkError');
  });

  it('detecta errores de Google/OAuth', () => {
    expect(mapAuthError(new Error('Google OAuth cancelled')).message).toBe('auth.errors.googleError');
  });

  it('cae en unknown para errores no reconocidos o tipos no-Error', () => {
    expect(mapAuthError(new Error('algo raro')).message).toBe('auth.errors.unknown');
    expect(mapAuthError('string error').message).toBe('auth.errors.unknown');
    expect(mapAuthError(null).message).toBe('auth.errors.unknown');
  });

  it('acepta objetos error-like con message', () => {
    expect(mapAuthError({ message: 'email already used' }).field).toBe('email');
  });

  it('mapea por status: 429 rate limit, 503 cold start, 5xx server error', () => {
    expect(mapAuthError({ status: 429, message: '' }).message).toBe('auth.errors.tooManyAttempts');
    expect(mapAuthError({ status: 503, message: '' }).message).toBe('auth.errors.serverWaking');
    expect(mapAuthError({ status: 500, message: '' }).message).toBe('auth.errors.serverError');
  });

  it('mapea 409/401 por status aunque el mensaje del backend venga en español', () => {
    expect(mapAuthError({ status: 409, message: 'El email ya está registrado' })).toEqual({
      message: 'auth.errors.emailAlreadyUsed',
      field: 'email',
    });
    expect(mapAuthError({ status: 401, message: 'Credenciales inválidas' }).message).toBe(
      'auth.errors.invalidCredentials',
    );
  });

  it('el status tiene prioridad sobre el texto del mensaje', () => {
    expect(mapAuthError({ status: 503, message: 'Authentication request failed' }).message).toBe(
      'auth.errors.serverWaking',
    );
  });
});
