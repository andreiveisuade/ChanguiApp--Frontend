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

  it('detecta credenciales inválidas', () => {
    expect(mapAuthError(new Error('Invalid login credentials')).message).toBe('auth.errors.invalidCredentials');
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
});
