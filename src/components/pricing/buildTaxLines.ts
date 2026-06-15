import { formatRate } from '@/utils/currency';
import type { TaxBreakdownLine } from '@/components/pricing/PriceBreakdown';

type TranslateFn = (key: string, opts?: Record<string, unknown>) => string;

// Único lugar que arma las líneas de IVA (label + monto) para PriceBreakdown a
// partir de las alícuotas del dominio. Lo comparten el carrito (N alícuotas) y
// el detalle de producto (una sola), para que el formato no diverja entre ambos.
export function buildTaxLines(
  taxes: Array<{ rate: number; amount: number }>,
  t: TranslateFn,
): TaxBreakdownLine[] {
  return taxes.map((tax) => ({
    label: t('pricing.iva', { rate: formatRate(tax.rate) }),
    amount: tax.amount,
  }));
}
