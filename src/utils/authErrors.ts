import i18n from '@/i18n';
import { AuthError } from '@/types/auth';

type ErrorLike = {
  message?: unknown;
  code?: unknown;
  status?: unknown;
};

const isErrorLike = (error: unknown): error is ErrorLike =>
  typeof error === 'object' && error !== null;

const getMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (isErrorLike(error) && typeof error.message === 'string') {
    return error.message;
  }

  return '';
};

export const mapAuthError = (error: unknown): AuthError => {
  const message = getMessage(error).toLowerCase();

  if (
    message.includes('already registered') ||
    message.includes('already exists') ||
    message.includes('user already') ||
    message.includes('email already') ||
    message.includes('duplicate')
  ) {
    return { message: i18n.t('auth.errors.emailAlreadyUsed'), field: 'email' };
  }

  if (
    message.includes('invalid login') ||
    message.includes('invalid credentials') ||
    message.includes('credenciales inválidas') ||
    message.includes('credenciales invalidas') ||
    message.includes('incorrect') ||
    message.includes('unauthorized')
  ) {
    return { message: i18n.t('auth.errors.invalidCredentials'), field: 'general' };
  }

  if (
    message.includes('network') ||
    message.includes('failed to fetch') ||
    message.includes('sin conexión') ||
    message.includes('timeout')
  ) {
    return { message: i18n.t('auth.errors.networkError'), field: 'general' };
  }

  if (message.includes('google') || message.includes('oauth')) {
    return { message: i18n.t('auth.errors.googleError'), field: 'general' };
  }

  return { message: i18n.t('auth.errors.unknown'), field: 'general' };
};
