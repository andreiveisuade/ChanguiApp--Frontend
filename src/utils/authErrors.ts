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

type AuthErrorRule = {
  keywords: string[];
  messageKey: string;
  field: NonNullable<AuthError['field']>;
};

// Primera regla cuyo keyword aparezca en el mensaje gana (orden = prioridad).
const ERROR_RULES: AuthErrorRule[] = [
  {
    keywords: ['already registered', 'already exists', 'user already', 'email already', 'duplicate'],
    messageKey: 'auth.errors.emailAlreadyUsed',
    field: 'email',
  },
  {
    keywords: ['invalid login', 'invalid credentials', 'credenciales inválidas', 'credenciales invalidas', 'incorrect', 'unauthorized'],
    messageKey: 'auth.errors.invalidCredentials',
    field: 'general',
  },
  {
    keywords: ['network', 'failed to fetch', 'sin conexión', 'timeout'],
    messageKey: 'auth.errors.networkError',
    field: 'general',
  },
  {
    keywords: ['google', 'oauth'],
    messageKey: 'auth.errors.googleError',
    field: 'general',
  },
];

const getStatus = (error: unknown): number | undefined =>
  isErrorLike(error) && typeof error.status === 'number' ? error.status : undefined;

// Errores transitorios del servidor: el status manda sobre el texto del mensaje.
const statusMessageKey = (status: number): string | null => {
  if (status === 429) return 'auth.errors.tooManyAttempts';
  if (status === 503) return 'auth.errors.serverWaking';
  if (status >= 500) return 'auth.errors.serverError';
  return null;
};

export const mapAuthError = (error: unknown): AuthError => {
  const status = getStatus(error);
  const statusKey = status !== undefined ? statusMessageKey(status) : null;
  if (statusKey) {
    return { message: i18n.t(statusKey), field: 'general' };
  }

  const message = getMessage(error).toLowerCase();
  const rule = ERROR_RULES.find((r) => r.keywords.some((kw) => message.includes(kw)));

  return {
    message: i18n.t(rule?.messageKey ?? 'auth.errors.unknown'),
    field: rule?.field ?? 'general',
  };
};
