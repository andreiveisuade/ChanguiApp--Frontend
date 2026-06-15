import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, ScrollView, View, RefreshControl, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import useAuth from '@/viewmodels/useAuth';
import useCart from '@/viewmodels/useCart';
import HomeHeader from '@/components/home/HomeHeader';
import CartSummaryCard from '@/components/home/CartSummaryCard';
import CartItemRow from '@/components/home/CartItemRow';
import EmptyCartMessage from '@/components/home/EmptyCartMessage';
import ErrorMessage from '@/components/feedback/ErrorMessage';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { colors, spacing } from '@/constants/theme';
import { ROUTES } from '@/constants/routes';

export default function HomeRoute(): React.JSX.Element {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { items, total, isLoading, error, refresh } = useCart();

  const handleProfilePress = (): void => {
    router.push(ROUTES.tabs.settings);
  };

  const userName = user?.full_name ?? t('home.defaultUser');

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
            colors={[colors.primary]} // Android spinner color
            tintColor={colors.primary} // iOS spinner color
          />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <ErrorMessage
              message={error}
              closeAccessibilityHint={t('auth.accessibility.dismissError')}
              onClose={refresh}
            />
          </View>
        ) : (
          <View style={styles.mainCard}>
            {/* Top row showing cart active status and total */}
            <CartSummaryCard itemCount={items.length} total={total} isLoading={isLoading} />

            {/* List separator divider, matching Figma design */}
            {items.length > 0 && <View style={styles.divider} />}

            {/* Nested items list */}
            {items.length > 0 && (
              <View style={styles.listContainer}>
                {items.map((item, index) => (
                  <CartItemRow key={item.id} item={item} isLast={index === items.length - 1} />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Empty state message, displayed below the card if cart has 0 items */}
        {items.length === 0 && !isLoading && !error && <EmptyCartMessage />}

        {/* Acceso a las listas de compra */}
        <Pressable
          onPress={() => router.push(ROUTES.lists)}
          accessibilityRole="button"
          accessibilityLabel={t('lists.openLists')}
          style={({ pressed }) => [styles.listsCard, pressed && styles.listsCardPressed]}
        >
          <AppIcon name="lista" size={24} color={colors.primary} />
          <AppText variant="H3" style={styles.listsCardText}>
            {t('lists.openLists')}
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  mainCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
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
  listsCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  listsCardPressed: {
    opacity: 0.85,
  },
  listsCardText: {
    textTransform: 'none',
  },
});
