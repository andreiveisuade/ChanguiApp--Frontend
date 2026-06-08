import { ErrorTranslationService } from '@/services/ErrorTranslationService';
import { NetworkError } from '@/types/errors';

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
