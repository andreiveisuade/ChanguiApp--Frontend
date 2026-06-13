import React from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { colors, fonts, radii, spacing, iconSize, fontSize } from '@/constants/theme';
import HistoryHeader from '@/components/layout/HistoryHeader';
import { PurchaseCard } from '@/components/purchases/PurchaseCard';
import useProfile from '@/viewmodels/useProfile';
import { usePurchaseHistory, DATE_FILTERS } from '@/viewmodels/usePurchaseHistory';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import ErrorMessage from '@/components/feedback/ErrorMessage';
import { ROUTES } from '@/constants/routes';
import { Purchase } from '@/types/domain';
import { formatARS } from '@/utils/currency';

export function PurchaseHistoryScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useProfile();
  const {
    purchases,
    filtered,
    summary,
    search,
    setSearch,
    filter,
    setFilter,
    isLoading,
    error,
    refresh,
  } = usePurchaseHistory();

  const userName = profile?.full_name || t('home.defaultUser');

  const goToDetail = (purchase: Purchase): void => {
    router.push({ pathname: ROUTES.purchaseDetail, params: { id: String(purchase.id) } });
  };

  const renderEmpty = (): React.JSX.Element | null => {
    if (isLoading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.stateContainer}>
          <ErrorMessage message={error} closeAccessibilityHint={t('common.retry')} onClose={refresh} />
        </View>
      );
    }
    return (
      <View style={styles.stateContainer}>
        <AppText variant="H3" style={styles.emptyTitle}>{t('historyScreen.emptyTitle')}</AppText>
        <AppText variant="Body" style={styles.emptySubtitle}>{t('historyScreen.emptySubtitle')}</AppText>
      </View>
    );
  };

  return (
    <View style={styles.page}>
      <HistoryHeader userName={userName} onProfilePress={() => router.push(ROUTES.tabs.settings)} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && purchases.length > 0}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.summary}>
              <View style={styles.summaryCol}>
                <AppText variant="Label" style={styles.summaryLabel}>{t('historyScreen.totalSpent')}</AppText>
                <AppText variant="Display" style={styles.summaryValue}>{formatARS(summary.totalSpent)}</AppText>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryCol}>
                <AppText variant="Label" style={styles.summaryLabel}>{t('historyScreen.completed')}</AppText>
                <AppText variant="Display" style={styles.summaryValue}>{summary.completedCount}</AppText>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <AppIcon name="buscar" size={iconSize.sm} color={colors.textSecondary} />
              <TextInput
                accessibilityLabel={t('historyScreen.searchA11y')}
                placeholder={t('historyScreen.searchPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>

            <View style={styles.filtersRow}>
              {DATE_FILTERS.map((option) => {
                const active = filter === option;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    onPress={() => setFilter(option)}
                    style={[styles.filterButton, active && styles.filterButtonActive]}
                  >
                    <AppText variant="Body" style={[styles.filterText, active && styles.filterTextActive]}>
                      {t(`historyScreen.filters.${option}`)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        renderItem={({ item }) => <PurchaseCard purchase={item} onPress={() => goToDetail(item)} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  summary: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  summaryCol: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    backgroundColor: colors.border,
    height: '100%',
    marginHorizontal: spacing.sm,
    width: 1,
  },
  summaryLabel: {
    marginBottom: spacing.xs,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: fontSize.h1,
    fontWeight: '800',
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 48,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.textPrimary,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.input,
    padding: 0,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: radii.lg,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: fontSize.body,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  separator: {
    height: spacing.md,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    padding: spacing.xl,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default PurchaseHistoryScreen;
