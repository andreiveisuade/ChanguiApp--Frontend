import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radii, spacing, touchTarget, iconSize } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import ErrorMessage from '@/components/feedback/ErrorMessage';
import { PurchaseItemRow } from '@/components/purchases/PurchaseItemRow';
import { usePurchaseDetail } from '@/viewmodels/usePurchaseDetail';
import { formatARS } from '@/utils/currency';
import { formatPurchaseDate } from '@/utils/date';

export function PurchaseDetailScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { purchase, isLoading, error, refresh } = usePurchaseDetail(params.id);

  const renderBody = (): React.JSX.Element => {
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
          <ErrorMessage
            message={error}
            closeAccessibilityHint={t('common.retry')}
            onClose={refresh}
          />
        </View>
      );
    }
    if (!purchase) {
      return (
        <View style={styles.stateContainer}>
          <AppText variant="Body" style={styles.emptySubtitle}>
            {t('purchaseDetail.notFound')}
          </AppText>
        </View>
      );
    }

    const storeName = purchase.store_name ?? t('historyScreen.unknownStore');
    const items = purchase.items;
    const summaryTotal = purchase.summary?.total ?? purchase.total;

    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metaCard}>
          <AppText variant="H2" style={styles.store}>
            {storeName}
          </AppText>
          <View style={styles.metaRow}>
            <AppIcon name="calendario" size={iconSize.xs} color={colors.textSecondary} />
            <AppText variant="Body">{formatPurchaseDate(purchase.date)}</AppText>
          </View>
          <View style={styles.metaRow}>
            <AppIcon name="tarjeta" size={iconSize.xs} color={colors.textSecondary} />
            <AppText variant="Body">
              {t('purchaseDetail.paymentStatus')}: {t(`historyScreen.status.${purchase.status}`)}
            </AppText>
          </View>
        </View>

        <AppText variant="H3" style={styles.sectionTitle}>
          {t('purchaseDetail.products', { count: items.length })}
        </AppText>
        <View style={styles.itemsCard}>
          {items.map((item, index) => (
            <PurchaseItemRow key={item.id} item={item} isLast={index === items.length - 1} />
          ))}
        </View>

        <View style={styles.summaryCard}>
          {purchase.summary ? (
            <>
              <View style={styles.summaryRow}>
                <AppText variant="Body">{t('purchaseDetail.subtotal')}</AppText>
                <AppText variant="Body" style={styles.summaryValue}>
                  {formatARS(purchase.summary.subtotal_net)}
                </AppText>
              </View>
              {purchase.summary.taxes.map((tax) => (
                <View key={tax.label} style={styles.summaryRow}>
                  <AppText variant="Body">{tax.label}</AppText>
                  <AppText variant="Body" style={styles.summaryValue}>
                    {formatARS(tax.amount)}
                  </AppText>
                </View>
              ))}
              <View style={styles.divider} />
            </>
          ) : null}
          <View style={styles.summaryRow}>
            <AppText variant="H3">{t('purchaseDetail.total')}</AppText>
            <AppText variant="Price">{formatARS(summaryTotal)}</AppText>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.page}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.headerBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel={t('purchaseDetail.back')}
          >
            <AppIcon name="atras" size={iconSize.md} color={colors.textPrimary} />
          </Pressable>
          <AppText variant="H2" style={styles.headerTitle}>
            {t('purchaseDetail.title')}
          </AppText>
        </View>
      </SafeAreaView>
      {renderBody()}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    flex: 1,
  },
  headerSafe: {
    backgroundColor: colors.white,
  },
  headerBar: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
  },
  headerTitle: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  metaCard: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  store: {
    textTransform: 'none',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    textTransform: 'none',
  },
  itemsCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.xs,
  },
  stateContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptySubtitle: {
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default PurchaseDetailScreen;
