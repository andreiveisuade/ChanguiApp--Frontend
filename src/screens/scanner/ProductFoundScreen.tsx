import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/layout/AppHeader';
import SuccessMessage from '@/components/feedback/SuccessMessage';
import ErrorMessage from '@/components/feedback/ErrorMessage';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { ProductCard } from '@/components/scanner/ProductCard';
import { ProductNotFound } from '@/components/scanner/ProductNotFound';
import { AppText } from '@/components/atoms/AppText';
import { PriceBreakdown } from '@/components/pricing/PriceBreakdown';
import { buildTaxLines } from '@/components/pricing/buildTaxLines';
import useProductFound from '@/viewmodels/useProductFound';
import { colors, radii, spacing } from '@/constants/theme';

export default function ProductFoundScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const {
    product,
    quantity,
    subtotal,
    netSubtotal,
    ivaSubtotal,
    taxRate,
    incrementQuantity,
    decrementQuantity,
    goToScanner,
    goToCart,
    isLoading,
    errorMessage,
    clearError,
  } = useProductFound();

  if (!product) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <SafeAreaView style={styles.safeArea}>
          <AppHeader showLogo={false} style={styles.header} onBack={goToScanner} />
          <ProductNotFound onRetry={goToScanner} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <SafeAreaView style={styles.safeArea}>
        <AppHeader showLogo={false} style={styles.header} onBack={isLoading ? undefined : goToScanner} />

        <SuccessMessage message={t('scanner.productFound')} />

        <View style={styles.content}>
          {errorMessage ? (
            <ErrorMessage
              message={errorMessage}
              closeAccessibilityHint={t('scanner.dismissError')}
              onClose={clearError}
            />
          ) : null}

          <ProductCard product={product} showBarcode />

          <AppText variant="Body" style={styles.quantityLabel}>
            {t('scanner.quantity')}
          </AppText>
          <View style={styles.quantityRow}>
            <SecondaryButton
              title="-"
              accessibilityHint={t('common.decrementQuantity')}
              onPress={decrementQuantity}
              disabled={quantity <= 1 || isLoading}
            />
            <AppText variant="H2" style={styles.quantityValue}>
              {quantity}
            </AppText>
            <SecondaryButton
              title="+"
              accessibilityHint={t('common.incrementQuantity')}
              onPress={incrementQuantity}
              disabled={isLoading}
            />
          </View>

          <View style={styles.breakdownBox}>
            <PriceBreakdown
              subtotalNet={netSubtotal}
              taxLines={buildTaxLines([{ rate: taxRate, amount: ivaSubtotal }], t)}
              total={subtotal}
            />
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              title={t('scanner.addToCart')}
              accessibilityHint={t('scanner.addToCartHint')}
              onPress={goToCart}
              isLoading={isLoading}
            />
            <SecondaryButton
              title={t('scanner.scanAnother')}
              accessibilityHint={t('scanner.scanAnotherHint')}
              onPress={goToScanner}
              disabled={isLoading}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.white,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  quantityLabel: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.xxl,
  },
  quantityRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  quantityValue: {
    marginHorizontal: spacing.xxl,
  },
  breakdownBox: {
    backgroundColor: colors.muted,
    borderRadius: radii.md,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  actions: {
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
});
