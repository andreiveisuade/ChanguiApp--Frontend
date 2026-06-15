import { ApiError, NetworkError, UserFriendlyError } from '@/types/errors';

type ErrorCode =
  | 'NETWORK_ERROR'
  | 'PARSE_ERROR'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

const MESSAGES: Record<ErrorCode, UserFriendlyError> = {
  NETWORK_ERROR: {
    title: 'Sin conexión',
    message: 'No tenés conexión a internet. Conectáte y probá de nuevo.',
    actionLabel: 'Reintentar',
    code: 'NETWORK_ERROR',
  },
  PARSE_ERROR: {
    title: 'Error de respuesta',
    message: 'Hubo un problema al procesar la respuesta. Intentá de nuevo.',
    actionLabel: 'Reintentar',
    code: 'PARSE_ERROR',
  },
  BAD_REQUEST: {
    title: 'Datos inválidos',
    message: 'Los datos enviados no son válidos. Verificá los campos.',
    actionLabel: 'Reintentar',
    code: 'BAD_REQUEST',
  },
  UNAUTHORIZED: {
    title: 'Sesión expirada',
    message: 'Tu sesión expiró. Ingresá de nuevo.',
    actionLabel: 'Ir a login',
    code: 'UNAUTHORIZED',
  },
  FORBIDDEN: {
    title: 'Sin permiso',
    message: 'No tenés permiso para acceder a este recurso.',
    actionLabel: 'Volver',
    code: 'FORBIDDEN',
  },
  NOT_FOUND: {
    title: 'No encontrado',
    message: 'No encontramos lo que buscás. Intentá de nuevo.',
    actionLabel: 'Reintentar',
    code: 'NOT_FOUND',
  },
  CONFLICT: {
    title: 'Conflicto',
    message: 'Esta acción no se puede completar ahora. Intentá en unos momentos.',
    actionLabel: 'Reintentar',
    code: 'CONFLICT',
  },
  SERVER_ERROR: {
    title: 'Error del servidor',
    message: 'Algo salió mal en nuestros servidores. Intentá más tarde.',
    actionLabel: 'Reintentar',
    code: 'SERVER_ERROR',
  },
  UNKNOWN: {
    title: 'Algo salió mal',
    message: 'Ocurrió un error inesperado. Intentá de nuevo.',
    actionLabel: 'Reintentar',
    code: 'UNKNOWN',
  },
};

const STATUS_TO_CODE: Record<number, ErrorCode> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
};

const named = (err: unknown, name: string): boolean => err instanceof Error && err.name === name;

const isNetworkError = (err: unknown): boolean =>
  err instanceof NetworkError || err instanceof TypeError || named(err, 'TypeError');

const isParseError = (err: unknown): boolean =>
  err instanceof SyntaxError || named(err, 'SyntaxError');

const extractStatusCode = (err: unknown): number | null => {
  if (err instanceof ApiError) return err.status;
  const message = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  const match = message.match(/Request failed with status (\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

const codeFromStatus = (status: number): ErrorCode | null =>
  STATUS_TO_CODE[status] ?? (status >= 500 ? 'SERVER_ERROR' : null);

const resolveCode = (err: unknown): ErrorCode => {
  if (isNetworkError(err)) return 'NETWORK_ERROR';
  if (isParseError(err)) return 'PARSE_ERROR';

  const status = extractStatusCode(err);
  return (status !== null && codeFromStatus(status)) || 'UNKNOWN';
};

export const ErrorTranslationService = {
  translate(err: unknown): UserFriendlyError {
    return { ...MESSAGES[resolveCode(err)] };
  },
};
