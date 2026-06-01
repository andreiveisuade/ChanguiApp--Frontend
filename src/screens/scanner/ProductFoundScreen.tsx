import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/layout/AppHeader';
import SuccessMessage from '@/components/feedback/SuccessMessage';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { ProductCard } from '@/components/scanner/ProductCard';
import { ProductNotFound } from '@/components/scanner/ProductNotFound';
import { AppText } from '@/components/atoms/AppText';
import { Product } from '@/types/domain';
import { colors, radii, spacing } from '@/constants/theme';
import { formatARS } from '@/utils/currency';

export function ProductFoundScreen(): React.JSX.Element {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ product: string; barcode: string }>();
  const product: Product | null = params.product ? JSON.parse(params.product) : null;
  const [quantity, setQuantity] = useState<number>(1);

  const goToScanner = (): void => router.replace('/(tabs)/scanner');
  const goToCart = (): void => router.replace('/(tabs)/cart');

  const decrementQuantity = (): void => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const incrementQuantity = (): void => setQuantity(quantity + 1);

  if (!product) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <SafeAreaView style={styles.safeArea}>
          <AppHeader onBack={goToScanner} />
          <ProductNotFound onRetry={goToScanner} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <SafeAreaView style={styles.safeArea}>
        <AppHeader onBack={goToScanner} />

        <SuccessMessage message={t('scanner.productFound')} />

        <View style={styles.content}>
          <ProductCard product={product} showBarcode />

          <AppText variant="Body" style={styles.quantityLabel}>
            {t('scanner.quantity')}
          </AppText>
          <View style={styles.quantityRow}>
            <SecondaryButton
              title="-"
              accessibilityHint={t('common.decrementQuantity')}
              onPress={decrementQuantity}
              disabled={quantity <= 1}
            />
            <AppText variant="H2" style={styles.quantityValue}>
              {quantity}
            </AppText>
            <SecondaryButton
              title="+"
              accessibilityHint={t('common.incrementQuantity')}
              onPress={incrementQuantity}
            />
          </View>

          <View style={styles.subtotalRow}>
            <AppText variant="Body" style={styles.subtotalLabel}>
              {t('scanner.subtotal')}
            </AppText>
            <AppText variant="H2">{formatARS(product.price * quantity)}</AppText>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              title={t('scanner.addToCart')}
              accessibilityHint={t('scanner.addToCartHint')}
              onPress={goToCart}
            />
            <SecondaryButton
              title={t('scanner.scanAnother')}
              accessibilityHint={t('scanner.scanAnotherHint')}
              onPress={goToScanner}
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
  subtotalRow: {
    alignItems: 'center',
    backgroundColor: colors.muted,
    borderRadius: radii.md,
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  subtotalLabel: {
    color: colors.textSecondary,
  },
  actions: {
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
});

export default ProductFoundScreen;
