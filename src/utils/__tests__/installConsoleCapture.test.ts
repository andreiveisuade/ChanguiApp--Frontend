import { logger } from '@/utils/debugStore';
import { installConsoleCapture } from '@/utils/installConsoleCapture';

jest.mock('@/utils/debugStore', () => ({
  logger: { log: jest.fn(), error: jest.fn() },
}));

describe('installConsoleCapture', () => {
  const originalError = console.error;
  const originalWarn = console.warn;

  afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
  });

  it('redirige console.error al debug store y preserva el original', () => {
    const base = jest.fn();
    console.error = base;
    installConsoleCapture();

    console.error('boom', new Error('x'), { a: 1 });

    expect(logger.error).toHaveBeenCalledWith('boom x {"a":1}');
    expect(base).toHaveBeenCalledWith('boom', expect.any(Error), { a: 1 });
  });

  it('redirige console.warn al debug store con nivel log', () => {
    console.warn('ojo');
    expect(logger.log).toHaveBeenCalledWith('ojo');
  });

  it('es idempotente: no vuelve a parchear', () => {
    const patched = console.error;
    installConsoleCapture();
    expect(console.error).toBe(patched);
  });
});
