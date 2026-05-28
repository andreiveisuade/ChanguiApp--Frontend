import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/atoms/AppText';
import { colors, spacing, touchTarget } from '@/constants/theme';
import { formatARS } from '@/utils/currency';

interface CartSummaryProps {
  subtotal: number;
  onPay?: () => void;
}

export function CartSummary({ subtotal, onPay }: CartSummaryProps): React.JSX.Element {
  const { t } = useTranslation();
  const disabled = !onPay;

  return (
    <View style={styles.container}>
      <View style={styles.line} />

      <View style={styles.row}>
        <AppText variant="H2">{t('cartScreen.subtotal')}</AppText>
        <AppText variant="H2">{formatARS(subtotal)}</AppText>
      </View>

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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
