import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PaymentStatus, Purchase } from '@/types/domain';
import { colors, radii, spacing, iconSize, fontSize } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { formatARS } from '@/utils/currency';
import { formatPurchaseDate } from '@/utils/date';

interface PurchaseCardProps {
  purchase: Purchase;
  onPress: () => void;
}

const STATUS_COLORS: Record<PaymentStatus, { bg: string; fg: string }> = {
  completed: { bg: colors.successSurface, fg: colors.success },
  pending: { bg: colors.warning, fg: colors.textPrimary },
  failed: { bg: colors.errorSurface, fg: colors.error },
};

export function PurchaseCard({ purchase, onPress }: PurchaseCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const storeName = purchase.store_name ?? t('historyScreen.unknownStore');
  const statusColor = STATUS_COLORS[purchase.status];

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`${storeName} — ${formatARS(purchase.total)}`}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <AppText variant="H3" style={styles.store} numberOfLines={1}>
          {storeName}
        </AppText>
        <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
          <AppText variant="Label" style={[styles.badgeText, { color: statusColor.fg }]}>
            {t(`historyScreen.status.${purchase.status}`)}
          </AppText>
        </View>
      </View>
      <View style={styles.row}>
        <AppText variant="Body">{formatPurchaseDate(purchase.date)}</AppText>
        <View style={styles.totalRow}>
          <AppText variant="Price">{formatARS(purchase.total)}</AppText>
          <AppIcon name="chevron-derecha" size={iconSize.sm} color={colors.textSecondary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    elevation: 2,
    gap: spacing.sm,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  store: {
    flex: 1,
    textTransform: 'none',
  },
  badge: {
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: fontSize.label,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
});

export default PurchaseCard;
