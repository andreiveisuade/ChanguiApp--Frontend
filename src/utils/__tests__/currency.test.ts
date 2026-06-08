import { formatARS, formatRate } from '../currency';

describe('currency utility tests', () => {
  describe('formatARS', () => {
    it('debe formatear un número entero correctamente con signo de peso y separador de miles', () => {
      expect(formatARS(1000)).toBe('$1.000');
    });

    it('debe redondear valores decimales antes de formatear', () => {
      expect(formatARS(1250.75)).toBe('$1.251');
      expect(formatARS(1250.4)).toBe('$1.250');
    });

    it('debe formatear cero correctamente', () => {
      expect(formatARS(0)).toBe('$0');
    });

    it('debe formatear números grandes con múltiples separadores de miles', () => {
      expect(formatARS(1234567)).toBe('$1.234.567');
    });

    it('debe formatear números pequeños sin separador de miles', () => {
      expect(formatARS(99)).toBe('$99');
    });
  });

  describe('formatRate', () => {
    it('debe formatear una tasa entera con signo de porcentaje', () => {
      expect(formatRate(21)).toBe('21%');
      expect(formatRate(0)).toBe('0%');
    });

    it('debe formatear una tasa decimal reemplazando el punto por coma', () => {
      expect(formatRate(10.5)).toBe('10,5%');
    });
  });
});
