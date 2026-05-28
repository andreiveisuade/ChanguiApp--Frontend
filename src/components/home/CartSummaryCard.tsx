import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { formatARS } from '@/utils/currency';

interface CartSummaryCardProps {
  itemCount: number;
  total: number;
  isLoading: boolean;
}

export const CartSummaryCard = ({ itemCount, total, isLoading }: CartSummaryCardProps) => {
  const { t } = useTranslation();

  const getProductsText = () => {
    if (itemCount === 0) {
      return t('home.emptyCart');
    }
    return itemCount === 1
      ? t('home.products_one', { count: itemCount })
      : t('home.products_other', { count: itemCount });
  };

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
            <AppText variant="H2" style={styles.productsCount}>
              {getProductsText()}
            </AppText>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        <AppText variant="Label">{t('home.total')}</AppText>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
        ) : (
          <AppText variant="Price" style={styles.totalValue}>
            {formatARS(total)}
          </AppText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
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

export default CartSummaryCard;
