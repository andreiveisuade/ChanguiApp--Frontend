import { formatPurchaseDate } from '../date';

describe('formatPurchaseDate', () => {
  it('formatea una fecha diurna como DD/MM/YYYY', () => {
    expect(formatPurchaseDate('2026-06-09T19:36:19Z')).toBe('09/06/2026');
  });

  it('una compra nocturna en AR no salta al día siguiente (23:00 AR = 02:00Z)', () => {
    // 2026-06-10T02:00:00Z son las 23:00 del 9 en Argentina (UTC-3).
    expect(formatPurchaseDate('2026-06-10T02:00:00Z')).toBe('09/06/2026');
  });

  it('la medianoche AR sí cuenta como el día nuevo (00:00 AR = 03:00Z)', () => {
    expect(formatPurchaseDate('2026-06-10T03:00:00Z')).toBe('10/06/2026');
  });

  it('devuelve string vacío para un ISO inválido', () => {
    expect(formatPurchaseDate('no-es-fecha')).toBe('');
  });
});
