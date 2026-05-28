import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/utils/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { formatARS } from '@/utils/currency';

interface CartSummaryBarProps {
  itemCount: number;
  total: number;
  isLoading: boolean;
}

export function CartSummaryBar({
  itemCount,
  total,
  isLoading,
}: CartSummaryBarProps): React.JSX.Element {
  const { t } = useTranslation();

  const productsText =
    itemCount === 0
      ? t('home.emptyCart')
      : itemCount === 1
        ? t('home.products_one', { count: itemCount })
        : t('home.products_other', { count: itemCount });

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <AppIcon name="carrito" size={24} color={colors.white} />
        </View>
        <View style={styles.infoContainer}>
          <AppText variant="Label">{t('home.activeCart')}</AppText>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
          ) : (
            <AppText variant="H2" style={styles.productsCount}>{productsText}</AppText>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        <AppText variant="Label">{t('home.total')}</AppText>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
        ) : (
          <AppText variant="Price" style={styles.totalValue}>{formatARS(total)}</AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftSection: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 48,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  productsCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  totalValue: {
    fontSize: 20,
  },
  spinner: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});

export default CartSummaryBar;
