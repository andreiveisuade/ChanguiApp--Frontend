import React from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import useAuth from '@/viewmodels/useAuth';
import useCart from '@/viewmodels/useCart';
import { CartHeader } from '@/components/cart/CartHeader';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import EmptyCartMessage from '@/components/home/EmptyCartMessage';
import ErrorMessage from '@/components/feedback/ErrorMessage';
import { AppText } from '@/components/atoms/AppText';
import { colors, spacing } from '@/constants/theme';

export default function CartScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { items, total, isLoading, error, refresh } = useCart();

  const userName = user?.full_name ?? t('home.defaultUser');

  return (
    <View style={styles.screen}>
      <CartHeader userName={userName} />

      <View style={styles.divider} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {error ? (
          <ErrorMessage
            message={error}
            closeAccessibilityHint={t('auth.accessibility.dismissError')}
            onClose={refresh}
          />
        ) : items.length === 0 && !isLoading ? (
          <EmptyCartMessage />
        ) : (
          <>
            <View style={styles.titleRow}>
              <AppText variant="H1">{t('cartScreen.detail')}</AppText>
              <AppText variant="Label">{t('cartScreen.updatedNow')}</AppText>
            </View>

            {items.map((item) => (
              <CartItem
                key={item.id}
                name={item.product?.name ?? t('home.fallbackProductName')}
                price={item.unit_price}
                quantity={item.quantity}
                imageUrl={item.product?.image_url ?? null}
              />
            ))}

            <CartSummary subtotal={total} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 120,
  },
  titleRow: {
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
