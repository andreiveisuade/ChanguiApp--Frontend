import { logger } from './debugStore';

// Aplana los argumentos de console.* a una línea legible para el overlay.
const format = (args: unknown[]): string =>
  args
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.message;
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(' ');

let installed = false;

/**
 * Redirige `console.error` y `console.warn` al debug store, además de la
 * consola nativa. Idempotente. Se invoca una sola vez al cargar la app para
 * que errores no-HTTP (render de React, librerías) también queden visibles en
 * el overlay, sin perder el log original de Metro/Logcat.
 */
export function installConsoleCapture(): void {
  if (installed) return;
  installed = true;

  const originalError = console.error.bind(console);
  const originalWarn = console.warn.bind(console);

  console.error = (...args: unknown[]): void => {
    logger.error(format(args));
    originalError(...args);
  };
  console.warn = (...args: unknown[]): void => {
    logger.log(format(args));
    originalWarn(...args);
  };
}
