import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, fonts, spacing } from '@/utils/theme';
import { AppText } from '@/components/atoms/AppText';

interface CartSummaryCardProps {
  itemCount: number;
  total: number;
  isLoading: boolean;
}

export const CartSummaryCard = ({ itemCount, total, isLoading }: CartSummaryCardProps) => {
  const { t } = useTranslation();

  // Manual currency formatter for ARS to prevent formatting variations across environments
  const formatCurrency = (value: number) => {
    const formatted = Math.round(value)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$${formatted}`;
  };

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
          <Feather name="shopping-cart" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.infoContainer}>
          <AppText variant="Label" style={styles.titleLabel}>{t('home.activeCart')}</AppText>
          {isLoading ? (
            <ActivityIndicator size="small" color="#D04946" style={styles.spinner} />
          ) : (
            <AppText variant="H2" style={styles.productsCount}>
              {getProductsText()}
            </AppText>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        <AppText variant="Label" style={styles.totalLabel}>{t('home.total')}</AppText>
        {isLoading ? (
          <ActivityIndicator size="small" color="#D04946" style={styles.spinner} />
        ) : (
          <AppText variant="Price" style={styles.totalValue}>
            {formatCurrency(total)}
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
    backgroundColor: '#D04946', // Primary brand red
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  productsCount: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  totalLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#666666',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  totalValue: {
    fontFamily: fonts.body,
    fontSize: 20,
    fontWeight: '700',
    color: '#D04946', // Brand red
  },
  spinner: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});

export default CartSummaryCard;
