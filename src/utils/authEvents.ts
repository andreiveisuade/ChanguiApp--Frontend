/**
 * Emitter para eventos de autenticación.
 *
 * Permite que la capa Repository (apiFetch) notifique a la capa ViewModel
 * (AuthContext) cuando la sesión expira, sin acoplamiento directo.
 */

type Listener = () => void;

const sessionExpiredListeners = new Set<Listener>();

export const authEvents = {
  /**
   * Registra un callback que se ejecuta cuando la sesión expira (401).
   * Retorna una función de cleanup.
   */
  onSessionExpired: (listener: Listener): (() => void) => {
    sessionExpiredListeners.add(listener);
    return () => {
      sessionExpiredListeners.delete(listener);
    };
  },

  /**
   * Notifica a todos los listeners que la sesión expiró.
   */
  emitSessionExpired: (): void => {
    sessionExpiredListeners.forEach((listener) => listener());
  },
};
