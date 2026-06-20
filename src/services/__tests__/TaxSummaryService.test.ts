import {
  buildSummaryFromItems,
  calculateItemsTotal,
  hasSummaryValues,
  round2,
  summarizeSingleProduct,
} from '@/services/TaxSummaryService';
import { CartItemWithProduct, Product, TaxBreakdown } from '@/types/domain';

const makeItem = (
  unit_price: number,
  quantity: number,
  tax?: TaxBreakdown,
): CartItemWithProduct => ({
  id: 'i',
  cart_id: 'c',
  product_id: 'p',
  quantity,
  unit_price,
  product: {
    id: 'p',
    name: 'Prod',
    barcode: '1',
    brand: null,
    image_url: null,
    price: unit_price,
    tax,
  },
});

describe('TaxSummaryService', () => {
  describe('round2', () => {
    it('redondea a 2 decimales', () => {
      expect(round2(1.005)).toBe(1.0); // limitación binaria conocida
      expect(round2(142.535)).toBe(142.54);
    });
  });

  describe('calculateItemsTotal', () => {
    it('suma unit_price * quantity', () => {
      expect(calculateItemsTotal([makeItem(100, 2), makeItem(50, 3)])).toBe(350);
    });
  });

  describe('hasSummaryValues', () => {
    it('false si undefined o todo en cero', () => {
      expect(hasSummaryValues(undefined)).toBe(false);
      expect(hasSummaryValues({ subtotal_net: 0, taxes: [], total: 0 })).toBe(false);
    });
    it('true si hay algún valor positivo', () => {
      expect(hasSummaryValues({ subtotal_net: 0, taxes: [], total: 100 })).toBe(true);
    });
  });

  describe('buildSummaryFromItems', () => {
    it('devuelve EMPTY_SUMMARY con lista vacía o total 0', () => {
      expect(buildSummaryFromItems([], 100)).toEqual({ subtotal_net: 0, taxes: [], total: 0 });
      expect(buildSummaryFromItems([makeItem(100, 1)], 0)).toEqual({
        subtotal_net: 0,
        taxes: [],
        total: 0,
      });
    });

    it('usa el desglose del backend cuando viene', () => {
      const tax: TaxBreakdown = { category: 'general', rate: 21, net_price: 100, tax_amount: 21 };
      const summary = buildSummaryFromItems([makeItem(121, 2, tax)], 242);
      expect(summary.total).toBe(242);
      expect(summary.subtotal_net).toBe(200);
      expect(summary.taxes).toEqual([{ rate: 21, label: 'IVA 21%', base: 200, amount: 42 }]);
    });

    it('sin desglose, asume 21% y despeja la base (semántica carrito)', () => {
      const summary = buildSummaryFromItems([makeItem(121, 1)], 121);
      expect(summary.taxes[0].rate).toBe(21);
      expect(summary.taxes[0].label).toBe('IVA 21%');
      expect(summary.subtotal_net).toBe(100);
      expect(summary.taxes[0].amount).toBe(21);
    });

    it('agrupa por alícuota con tasas mixtas', () => {
      const t21: TaxBreakdown = { category: 'general', rate: 21, net_price: 100, tax_amount: 21 };
      const t105: TaxBreakdown = {
        category: 'basico',
        rate: 10.5,
        net_price: 100,
        tax_amount: 10.5,
      };
      const summary = buildSummaryFromItems(
        [makeItem(121, 1, t21), makeItem(110.5, 1, t105)],
        231.5,
      );
      expect(summary.taxes).toHaveLength(2);
      expect(summary.taxes.map((t) => t.label)).toEqual(
        expect.arrayContaining(['IVA 21%', 'IVA 10.5%']),
      );
    });
  });

  describe('summarizeSingleProduct', () => {
    it('producto null devuelve todo en cero', () => {
      expect(summarizeSingleProduct(null, 3)).toEqual({
        subtotal: 0,
        netSubtotal: 0,
        ivaSubtotal: 0,
        taxRate: 0,
      });
    });

    it('con desglose del backend multiplica por cantidad', () => {
      const product: Pick<Product, 'price' | 'tax'> = {
        price: 121,
        tax: { category: 'general', rate: 21, net_price: 100, tax_amount: 21 },
      };
      expect(summarizeSingleProduct(product, 2)).toEqual({
        subtotal: 242,
        netSubtotal: 200,
        ivaSubtotal: 42,
        taxRate: 21,
      });
    });

    it('sin desglose, IVA 0 y neto = bruto (semántica detalle de producto)', () => {
      const product: Pick<Product, 'price' | 'tax'> = { price: 100 };
      expect(summarizeSingleProduct(product, 2)).toEqual({
        subtotal: 200,
        netSubtotal: 200,
        ivaSubtotal: 0,
        taxRate: 0,
      });
    });
  });
});
