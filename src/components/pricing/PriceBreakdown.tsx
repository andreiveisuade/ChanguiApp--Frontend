import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/atoms/AppText';
import { colors, spacing } from '@/constants/theme';
import { formatARS } from '@/utils/currency';

export interface TaxBreakdownLine {
  label: string;
  amount: number;
}

interface PriceBreakdownProps {
  subtotalNet: number;
  taxLines: TaxBreakdownLine[];
  total: number;
}

/**
 * Desglose de IVA reutilizable: precio sin IVA + una línea por alícuota + total.
 * Lo consumen el producto escaneado, el carrito y el detalle de compra.
 */
export function PriceBreakdown({
  subtotalNet,
  taxLines,
  total,
}: PriceBreakdownProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View>
      <View style={styles.row}>
        <AppText variant="Body" style={styles.muted}>
          {t('pricing.priceWithoutTax')}
        </AppText>
        <AppText variant="Body">{formatARS(subtotalNet)}</AppText>
      </View>

      {taxLines.map((line, index) => (
        <View key={`${line.label}-${index}`} style={styles.row}>
          <AppText variant="Body" style={styles.muted}>
            {line.label}
          </AppText>
          <AppText variant="Body">{formatARS(line.amount)}</AppText>
        </View>
      ))}

      <View style={[styles.row, styles.totalRow]}>
        <AppText variant="H2">{t('pricing.total')}</AppText>
        <AppText variant="H2">{formatARS(total)}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  muted: {
    color: colors.textSecondary,
  },
  totalRow: {
    marginTop: spacing.sm,
    marginBottom: 0,
  },
});

export default PriceBreakdown;
