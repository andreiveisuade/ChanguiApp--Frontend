import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, ScrollView, View, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import useAuth from '@/viewmodels/useAuth';
import useCart from '@/viewmodels/useCart';
import HomeHeader from '@/components/home/HomeHeader';
import CartSummaryCard from '@/components/home/CartSummaryCard';
import CartItemRow from '@/components/home/CartItemRow';
import EmptyCartMessage from '@/components/home/EmptyCartMessage';
import ErrorMessage from '@/components/feedback/ErrorMessage';
import { colors, fonts, spacing } from '@/utils/theme';

export default function HomeRoute(): React.JSX.Element {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { items, total, isLoading, error, refresh } = useCart();

  const handleProfilePress = (): void => {
    router.push('/(tabs)/settings');
  };

  const userName = user?.full_name ?? 'Usuario';

  return (
    <View style={styles.container}>
      {/* 1. Header (Sticky, outside ScrollView) */}
      <HomeHeader userName={userName} onProfilePress={handleProfilePress} />

      {/* 2. ScrollView body */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            colors={['#D04946']} // Android spinner color
            tintColor="#D04946" // iOS spinner color
          />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <ErrorMessage
              message={error}
              closeAccessibilityHint={t('auth.accessibility.dismissError')}
              onClose={() => {}}
            />
          </View>
        ) : (
          <View style={styles.mainCard}>
            {/* Top row showing cart active status and total */}
            <CartSummaryCard
              itemCount={items.length}
              total={total}
              isLoading={isLoading}
            />

            {/* List separator divider, matching Figma design */}
            {items.length > 0 && <View style={styles.divider} />}

            {/* Nested items list */}
            {items.length > 0 && (
              <View style={styles.listContainer}>
                {items.map((item, index) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    isLast={index === items.length - 1}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Empty state message, displayed below the card if cart has 0 items */}
        {items.length === 0 && !isLoading && !error && (
          <EmptyCartMessage />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 24,
    marginTop: 20,
    padding: spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: spacing.md,
  },
  listContainer: {
    marginTop: spacing.xs,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
});
