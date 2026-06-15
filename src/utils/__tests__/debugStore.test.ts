import { debugStore, logger } from '@/utils/debugStore';

describe('debugStore', () => {
  afterEach(() => debugStore.clear());

  it('actualiza el snapshot de logs de forma sincrónica', () => {
    logger.log('hola');
    expect(debugStore.getLogs()[0].message).toBe('hola');
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
