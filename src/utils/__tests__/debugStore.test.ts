import { debugStore, logger } from '@/utils/debugStore';

describe('debugStore', () => {
  afterEach(() => debugStore.clear());

  it('actualiza el snapshot de logs de forma sincrónica', () => {
    logger.log('hola');
    expect(debugStore.getLogs()[0].message).toBe('hola');
  });

  it('logger.log/error usan source console', () => {
    logger.log('a');
    logger.error('b');
    const [err, log] = debugStore.getLogs();
    expect(log.source).toBe('console');
    expect(log.level).toBe('log');
    expect(err.source).toBe('console');
    expect(err.level).toBe('error');
  });

  it('logger.call registra origen, latencia y nivel', () => {
    logger.call({ source: 'http', message: '200 GET /api/cart', durationMs: 42 });
    const entry = debugStore.getLogs()[0];
    expect(entry.source).toBe('http');
    expect(entry.message).toBe('200 GET /api/cart');
    expect(entry.durationMs).toBe(42);
    expect(entry.level).toBe('log');
  });

  it('logger.call con level error marca la entrada como error', () => {
    logger.call({ source: 'sqlite', level: 'error', message: 'boom' });
    const entry = debugStore.getLogs()[0];
    expect(entry.level).toBe('error');
    expect(entry.source).toBe('sqlite');
    expect(entry.durationMs).toBeUndefined();
  });

  it('notifica a los suscriptores de forma DIFERIDA, no durante el render que emitió el log', async () => {
    const listener = jest.fn();
    const unsubscribe = debugStore.subscribe(listener);

    logger.log('emitido en render');
    // Clave de la regresión: si esto fuera sincrónico, un console.warn durante
    // un render dispararía un setState del overlay en pleno render (crash).
    expect(listener).not.toHaveBeenCalled();

    await Promise.resolve();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('coalesce varios logs en una sola notificación por microtask', async () => {
    const listener = jest.fn();
    const unsubscribe = debugStore.subscribe(listener);

    logger.log('a');
    logger.error('b');
    logger.log('c');

    await Promise.resolve();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });
});
