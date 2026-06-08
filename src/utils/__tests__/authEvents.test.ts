import { authEvents } from '../authEvents';

describe('authEvents', () => {
  it('notifica a todos los listeners registrados al emitir', () => {
    const l1 = jest.fn();
    const l2 = jest.fn();
    const un1 = authEvents.onSessionExpired(l1);
    const un2 = authEvents.onSessionExpired(l2);

    authEvents.emitSessionExpired();

    expect(l1).toHaveBeenCalledTimes(1);
    expect(l2).toHaveBeenCalledTimes(1);

    un1();
    un2();
  });

  it('la función de cleanup desuscribe el listener', () => {
    const l1 = jest.fn();
    const unsubscribe = authEvents.onSessionExpired(l1);

    unsubscribe();
    authEvents.emitSessionExpired();

    expect(l1).not.toHaveBeenCalled();
  });
});
