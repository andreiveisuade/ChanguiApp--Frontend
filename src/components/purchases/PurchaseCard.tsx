import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Purchase } from '@/types/domain';
import { colors, radii, spacing } from '@/utils/theme';
import { AppText } from '@/components/atoms/AppText';
import { formatARS } from '@/utils/currency';

interface PurchaseCardProps {
  purchase: Purchase;
  onPress: () => void;
}

export function PurchaseCard({ purchase, onPress }: PurchaseCardProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`${purchase.store_name} — ${formatARS(purchase.total)}`}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <AppText variant="H3" style={styles.store} numberOfLines={1}>
          {purchase.store_name}
        </AppText>
        <Feather name="chevron-right" size={18} color={colors.textSecondary} />
      </View>
      <View style={styles.row}>
        <AppText variant="Body">{purchase.date}</AppText>
        <AppText variant="Price">{formatARS(purchase.total)}</AppText>
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
    justifyContent: 'space-between',
  },
  store: {
    flex: 1,
    textTransform: 'none',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default PurchaseCard;
