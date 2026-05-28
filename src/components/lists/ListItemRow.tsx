import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ShoppingListItem } from '@/types/domain';
import { colors, spacing, touchTarget } from '@/utils/theme';
import { AppText } from '@/components/atoms/AppText';

interface ListItemRowProps {
  item: ShoppingListItem;
  onToggle: () => void;
  isLast?: boolean;
}

export function ListItemRow({
  item,
  onToggle,
  isLast = false,
}: ListItemRowProps): React.JSX.Element {
  return (
    <View style={[styles.row, isLast && styles.noBorder]}>
      <Pressable
        onPress={onToggle}
        accessibilityLabel={
          item.purchased ? 'Marcar como no comprado' : 'Marcar como comprado'
        }
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.purchased }}
        style={({ pressed }) => [styles.checkbox, pressed && styles.checkboxPressed]}
      >
        {item.purchased ? (
          <Feather name="check-circle" size={22} color={colors.success} />
        ) : (
          <Feather name="circle" size={22} color={colors.border} />
        )}
      </Pressable>

      <AppText
        variant="H3"
        style={[styles.name, item.purchased && styles.nameStruck]}
        numberOfLines={1}
      >
        {item.name}
      </AppText>

      {item.quantity > 1 ? (
        <AppText variant="Label" style={styles.qty}>×{item.quantity}</AppText>
      ) : null}
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
    paddingVertical: spacing.sm,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  checkbox: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
  },
  checkboxPressed: {
    opacity: 0.6,
  },
  name: {
    flex: 1,
    textTransform: 'none',
  },
  nameStruck: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  qty: {
    textTransform: 'none',
  },
});

export default ListItemRow;
