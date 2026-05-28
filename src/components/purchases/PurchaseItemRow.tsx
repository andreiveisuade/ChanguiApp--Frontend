import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PurchaseItem } from '@/types/domain';
import { colors, spacing } from '@/utils/theme';
import { AppText } from '@/components/atoms/AppText';
import { formatARS } from '@/utils/currency';

interface PurchaseItemRowProps {
  item: PurchaseItem;
  isLast?: boolean;
}

export function PurchaseItemRow({
  item,
  isLast = false,
}: PurchaseItemRowProps): React.JSX.Element {
  const lineTotal = item.unit_price * item.quantity;

  return (
    <View style={[styles.row, isLast && styles.noBorder]}>
      <AppText variant="H3" style={styles.name} numberOfLines={2}>
        {item.product_name}
      </AppText>
      <AppText variant="Body" style={styles.qty}>×{item.quantity}</AppText>
      <AppText variant="Body" style={styles.price}>{formatARS(lineTotal)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  name: {
    flex: 1,
    textTransform: 'none',
  },
  qty: {
    color: colors.textSecondary,
    minWidth: 28,
    textAlign: 'center',
  },
  price: {
    color: colors.textPrimary,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },
});

export default PurchaseItemRow;
