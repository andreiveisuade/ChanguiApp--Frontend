import { CartItemWithProduct, Product, TaxLine, TaxSummary } from '@/types/domain';

// Cálculo del desglose de IVA en el cliente. Vive en un service (no en el
// repositorio ni en los viewmodels) para centralizar la regla fiscal y poder
// testearla aislada. El backend ya manda el desglose; estas funciones son el
// fallback de presentación cuando no viene (Information Expert).

export const DEFAULT_TAX_RATE = 21;
export const EMPTY_SUMMARY: TaxSummary = { subtotal_net: 0, taxes: [], total: 0 };

export const round2 = (n: number): number => Math.round(n * 100) / 100;

export function calculateItemsTotal(items: CartItemWithProduct[]): number {
  return items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
}

export function hasSummaryValues(summary: TaxSummary | undefined): summary is TaxSummary {
  if (!summary) return false;

  return (
    summary.subtotal_net > 0 ||
    summary.total > 0 ||
    summary.taxes.some((tax) => tax.base > 0 || tax.amount > 0)
  );
}

// Desglose de un carrito (alícuotas mixtas). Semántica del carrito: si un ítem
// no trae desglose del backend, se asume la alícuota general (21%) y se despeja
// la base imponible hacia atrás (el precio es final con IVA incluido).
export function buildSummaryFromItems(items: CartItemWithProduct[], total: number): TaxSummary {
  if (items.length === 0 || total <= 0) return EMPTY_SUMMARY;

  const groupedTaxes = new Map<number, TaxLine>();
  let subtotalNet = 0;

  items.forEach((item) => {
    const lineTotal = item.unit_price * item.quantity;
    const productTax = item.product?.tax;
    const rate = productTax?.rate ?? DEFAULT_TAX_RATE;
    const netAmount = productTax
      ? productTax.net_price * item.quantity
      : lineTotal / (1 + rate / 100);
    const taxAmount = productTax ? productTax.tax_amount * item.quantity : lineTotal - netAmount;
    const current = groupedTaxes.get(rate) ?? { rate, label: `IVA ${rate}%`, base: 0, amount: 0 };

    current.base += netAmount;
    current.amount += taxAmount;
    groupedTaxes.set(rate, current);
    subtotalNet += netAmount;
  });

  return {
    subtotal_net: round2(subtotalNet),
    taxes: Array.from(groupedTaxes.values()).map((tax) => ({
      ...tax,
      base: round2(tax.base),
      amount: round2(tax.amount),
    })),
    total: round2(total),
  };
}

export interface SingleProductTax {
  subtotal: number;
  netSubtotal: number;
  ivaSubtotal: number;
  taxRate: number;
}

// Desglose de un único producto por cantidad (pantalla de producto encontrado).
// Semántica del detalle: NO se asume alícuota en el cliente. Si el backend no
// trae desglose, el IVA es 0 y el neto coincide con el bruto. (Distinto del
// carrito, que sí asume 21% como fallback — son dos reglas a propósito.)
export function summarizeSingleProduct(
  product: Pick<Product, 'price' | 'tax'> | null,
  quantity: number,
): SingleProductTax {
  const subtotal = product ? product.price * quantity : 0;
  const netSubtotal = product?.tax ? product.tax.net_price * quantity : subtotal;
  const ivaSubtotal = product?.tax ? product.tax.tax_amount * quantity : 0;
  const taxRate = product?.tax?.rate ?? 0;
  return { subtotal, netSubtotal, ivaSubtotal, taxRate };
}
