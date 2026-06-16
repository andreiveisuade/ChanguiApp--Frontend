import { buildTaxLines } from '@/components/pricing/buildTaxLines';

// Mock simple de t: concatena la key con el rate interpolado.
const t = (key: string, opts?: Record<string, unknown>) => `${key}_${opts?.rate ?? ''}`;

describe('buildTaxLines', () => {
  it('mapea cada alícuota a { label, amount } con la tasa formateada', () => {
    const result = buildTaxLines(
      [
        { rate: 21, amount: 42 },
        { rate: 10.5, amount: 10.5 },
      ],
      t,
    );
    expect(result).toEqual([
      { label: 'pricing.iva_21%', amount: 42 },
      { label: 'pricing.iva_10,5%', amount: 10.5 },
    ]);
  });

  it('devuelve [] con lista vacía', () => {
    expect(buildTaxLines([], t)).toEqual([]);
  });
});
