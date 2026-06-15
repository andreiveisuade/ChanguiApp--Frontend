import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/atoms/AppText';
import { PriceBreakdown } from '@/components/pricing/PriceBreakdown';
import { colors, spacing, touchTarget } from '@/constants/theme';
import { formatRate } from '@/utils/currency';
import { TaxSummary } from '@/types/domain';

interface CartSummaryProps {
  summary: TaxSummary;
  onPay?: () => void;
}

export function CartSummary({ summary, onPay }: CartSummaryProps): React.JSX.Element {
  const { t } = useTranslation();
  const disabled = !onPay;

  const taxLines = summary.taxes.map((tax) => ({
    label: t('pricing.iva', { rate: formatRate(tax.rate) }),
    amount: tax.amount,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.line} />

      <PriceBreakdown
        subtotalNet={summary.subtotal_net}
        taxLines={taxLines}
        total={summary.total}
      />

      <Pressable
        style={[styles.payButton, disabled && styles.payButtonDisabled]}
        onPress={onPay}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={t('cartScreen.checkout')}
        accessibilityHint={t('cartScreen.checkoutHint')}
      >
        <AppText variant="H3" style={styles.payButtonText}>
          {t('cartScreen.checkout')}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  line: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  payButton: {
    marginTop: spacing.xl,
    minHeight: touchTarget.minHeight,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    backgroundColor: colors.secondary,
    opacity: 0.7,
  },
  payButtonText: {
    color: colors.white,
  },
});

export default CartSummary;
