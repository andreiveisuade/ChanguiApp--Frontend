/**
 * Store de debug minimalista (sin librerías): un flag on/off y un ring buffer
 * de logs, con suscripción para React. Funciona en builds release (a diferencia
 * de __DEV__). Se activa con un easter egg (5 taps en el saludo del home).
 */
export type LogLevel = 'log' | 'error';

// De dónde salió la llamada, para que el overlay muestre A DÓNDE pega la app:
// backend HTTP, SQLite local, cache de react-query (no salió a ningún lado) o
// un log/warn de consola.
export type LogSource = 'http' | 'sqlite' | 'cache' | 'console';

export type LogEntry = {
  id: number;
  time: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  durationMs?: number;
};

const MAX_LOGS = 80;

let enabled = false;
let logs: LogEntry[] = [];
let seq = 0;
const listeners = new Set<() => void>();

// Notifica de forma diferida (microtask) y coalescida: si un log se emite
// durante el render de un componente (p. ej. un console.warn de una librería),
// la actualización de los suscriptores NO debe ocurrir sincrónicamente dentro
// de ese render — eso dispararía "setState during render" en el overlay.
let notifyScheduled = false;
const notify = (): void => {
  if (notifyScheduled) return;
  notifyScheduled = true;
  queueMicrotask(() => {
    notifyScheduled = false;
    listeners.forEach((listener) => listener());
  });
};

const append = (
  level: LogLevel,
  source: LogSource,
  message: string,
  durationMs?: number,
): void => {
  seq += 1;
  const entry: LogEntry = {
    id: seq,
    time: new Date().toLocaleTimeString(),
    level,
    source,
    message,
    durationMs,
  };
  logs = [entry, ...logs].slice(0, MAX_LOGS);
  notify();
};

export const debugStore = {
  isEnabled: (): boolean => enabled,
  enable: (): void => {
    if (enabled) return;
    enabled = true;
    notify();
  },
  disable: (): void => {
    if (!enabled) return;
    enabled = false;
    notify();
  },
  getLogs: (): LogEntry[] => logs,
  clear: (): void => {
    logs = [];
    notify();
  },
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export const logger = {
  // Logs de consola (console.log/warn/error capturados): source 'console'.
  log: (message: string): void => append('log', 'console', message),
  error: (message: string): void => append('error', 'console', message),
  // Llamada estructurada con su origen (http/sqlite/cache) y latencia opcional.
  call: (params: {
    source: LogSource;
    message: string;
    level?: LogLevel;
    durationMs?: number;
  }): void => append(params.level ?? 'log', params.source, params.message, params.durationMs),
};
