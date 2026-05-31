import { AuthSessionExpiredError, NetworkError, UserFriendlyError } from '@/types/errors';

export const ErrorTranslationService = {
  translate(err: unknown): UserFriendlyError {
    // Log the original error internally for debugging
    console.error('[ErrorTranslationService]', err);

    // Network errors (including TypeError from failed fetch calls)
    if (
      err instanceof NetworkError ||
      err instanceof TypeError ||
      (err instanceof Error && err.name === 'TypeError')
    ) {
      return {
        title: 'Sin conexión',
        message: 'No tenés conexión a internet. Conectáte y probá de nuevo.',
        actionLabel: 'Reintentar',
        code: 'NETWORK_ERROR',
      };
    }

    // JSON parsing/Response processing errors
    if (
      err instanceof SyntaxError ||
      (err instanceof Error && err.name === 'SyntaxError')
    ) {
      return {
        title: 'Error de respuesta',
        message: 'Hubo un problema al procesar la respuesta. Intentá de nuevo.',
        actionLabel: 'Reintentar',
        code: 'PARSE_ERROR',
      };
    }

    // Try to extract standard HTTP status codes
    let statusCode: number | null = null;
    let messageStr = '';

    if (err instanceof Error) {
      messageStr = err.message;
    } else if (typeof err === 'string') {
      messageStr = err;
    }

    if (messageStr) {
      const match = messageStr.match(/Request failed with status (\d+)/i);
      if (match) {
        statusCode = parseInt(match[1], 10);
      }
    }

    if (statusCode !== null) {
      if (statusCode === 400) {
        return {
          title: 'Datos inválidos',
          message: 'Los datos enviados no son válidos. Verificá los campos.',
          actionLabel: 'Reintentar',
          code: 'BAD_REQUEST',
        };
      }
      if (statusCode === 401) {
        return {
          title: 'Sesión expirada',
          message: 'Tu sesión expiró. Ingresá de nuevo.',
          actionLabel: 'Ir a login',
          code: 'UNAUTHORIZED',
        };
      }
      if (statusCode === 403) {
        return {
          title: 'Sin permiso',
          message: 'No tenés permiso para acceder a este recurso.',
          actionLabel: 'Volver',
          code: 'FORBIDDEN',
        };
      }
      if (statusCode === 404) {
        return {
          title: 'No encontrado',
          message: 'No encontramos lo que buscás. Intentá de nuevo.',
          actionLabel: 'Reintentar',
          code: 'NOT_FOUND',
        };
      }
      if (statusCode === 409) {
        return {
          title: 'Conflicto',
          message: 'Esta acción no se puede completar ahora. Intentá en unos momentos.',
          actionLabel: 'Reintentar',
          code: 'CONFLICT',
        };
      }
      if (statusCode >= 500) {
        return {
          title: 'Error del servidor',
          message: 'Algo salió mal en nuestros servidores. Intentá más tarde.',
          actionLabel: 'Reintentar',
          code: 'SERVER_ERROR',
        };
      }
    }

    // Fallback for any other unexpected error
    return {
      title: 'Algo salió mal',
      message: 'Ocurrió un error inesperado. Intentá de nuevo.',
      actionLabel: 'Reintentar',
      code: 'UNKNOWN',
    };
  },
};
