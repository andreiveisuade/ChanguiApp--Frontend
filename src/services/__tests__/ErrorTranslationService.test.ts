import { ErrorTranslationService } from '@/services/ErrorTranslationService';
import { ApiError, NetworkError } from '@/types/errors';

// Suppress console.error inside the test output
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('ErrorTranslationService', () => {
  it('translates NetworkError correctly', () => {
    const error = new NetworkError();
    const result = ErrorTranslationService.translate(error);
    expect(result).toEqual({
      title: 'Sin conexión',
      message: 'No tenés conexión a internet. Conectáte y probá de nuevo.',
      actionLabel: 'Reintentar',
      code: 'NETWORK_ERROR',
    });
  });

  it('translates TypeError correctly', () => {
    const error = new TypeError('Failed to fetch');
    const result = ErrorTranslationService.translate(error);
    expect(result.code).toBe('NETWORK_ERROR');
  });

  it('translates SyntaxError correctly', () => {
    const error = new SyntaxError('Unexpected token < in JSON');
    const result = ErrorTranslationService.translate(error);
    expect(result).toEqual({
      title: 'Error de respuesta',
      message: 'Hubo un problema al procesar la respuesta. Intentá de nuevo.',
      actionLabel: 'Reintentar',
      code: 'PARSE_ERROR',
    });
  });

  it('translates HTTP 400 status correctly', () => {
    const error = new Error('Request failed with status 400');
    const result = ErrorTranslationService.translate(error);
    expect(result.code).toBe('BAD_REQUEST');
  });

  it('translates HTTP 401 status correctly', () => {
    const error = new Error('Request failed with status 401');
    const result = ErrorTranslationService.translate(error);
    expect(result.code).toBe('UNAUTHORIZED');
    expect(result.actionLabel).toBe('Ir a login');
  });

  it('translates HTTP 403 status correctly', () => {
    const error = new Error('Request failed with status 403');
    const result = ErrorTranslationService.translate(error);
    expect(result.code).toBe('FORBIDDEN');
  });

  it('translates HTTP 404 status correctly', () => {
    const error = new Error('Request failed with status 404');
    const result = ErrorTranslationService.translate(error);
    expect(result.code).toBe('NOT_FOUND');
  });

  it('translates HTTP 409 status correctly', () => {
    const error = new Error('Request failed with status 409');
    const result = ErrorTranslationService.translate(error);
    expect(result.code).toBe('CONFLICT');
  });

  it('translates HTTP 500 status correctly', () => {
    const error = new Error('Request failed with status 500');
    const result = ErrorTranslationService.translate(error);
    expect(result.code).toBe('SERVER_ERROR');
  });

  it('translates any 5xx status to SERVER_ERROR', () => {
    const result = ErrorTranslationService.translate(new Error('Request failed with status 503'));
    expect(result.code).toBe('SERVER_ERROR');
  });

  it('falls back to UNKNOWN for an unmapped status code', () => {
    const result = ErrorTranslationService.translate(new Error('Request failed with status 418'));
    expect(result.code).toBe('UNKNOWN');
  });

  it('extracts the status code from a string error', () => {
    const result = ErrorTranslationService.translate('Request failed with status 404');
    expect(result.code).toBe('NOT_FOUND');
  });

  it('reads the status from a structured ApiError (no string parsing)', () => {
    expect(ErrorTranslationService.translate(new ApiError(404, 'No encontrado')).code).toBe(
      'NOT_FOUND',
    );
  });

  it('translates an ApiError with a custom backend message by its status', () => {
    // El message ya no es "Request failed with status N"; igual resuelve por status.
    expect(ErrorTranslationService.translate(new ApiError(400, 'Email ya registrado')).code).toBe(
      'BAD_REQUEST',
    );
  });

  it('maps a 5xx ApiError to SERVER_ERROR', () => {
    expect(ErrorTranslationService.translate(new ApiError(503, 'caído')).code).toBe('SERVER_ERROR');
  });

  it('falls back to UNKNOWN for unexpected errors', () => {
    const error = new Error('Some random backend error');
    const result = ErrorTranslationService.translate(error);
    expect(result).toEqual({
      title: 'Algo salió mal',
      message: 'Ocurrió un error inesperado. Intentá de nuevo.',
      actionLabel: 'Reintentar',
      code: 'UNKNOWN',
    });
  });
});
