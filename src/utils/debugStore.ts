/**
 * Store de debug minimalista (sin librerías): un flag on/off y un ring buffer
 * de logs, con suscripción para React. Funciona en builds release (a diferencia
 * de __DEV__). Se activa con un easter egg (5 taps en el saludo del home).
 */
export type LogLevel = 'log' | 'error';

export type LogEntry = {
  id: number;
  time: string;
  level: LogLevel;
  message: string;
};

const MAX_LOGS = 80;

let enabled = false;
let logs: LogEntry[] = [];
let seq = 0;
const listeners = new Set<() => void>();

const notify = (): void => {
  listeners.forEach((listener) => listener());
};

const append = (level: LogLevel, message: string): void => {
  seq += 1;
  const entry: LogEntry = {
    id: seq,
    time: new Date().toLocaleTimeString(),
    level,
    message,
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
  log: (message: string): void => append('log', message),
  error: (message: string): void => append('error', message),
};
