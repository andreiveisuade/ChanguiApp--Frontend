import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShoppingListItem } from '@/types/domain';
import { colors, iconSize, spacing, touchTarget } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';

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
  const { t } = useTranslation();

  return (
    <View style={[styles.row, isLast && styles.noBorder]}>
      <Pressable
        onPress={onToggle}
        accessibilityLabel={
          item.purchased ? t('lists.markUnpurchased') : t('lists.markPurchased')
        }
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.purchased }}
        style={({ pressed }) => [styles.checkbox, pressed && styles.checkboxPressed]}
      >
        {item.purchased ? (
          <AppIcon name="exito" size={iconSize.md} color={colors.success} />
        ) : (
          <AppIcon name="circulo" size={iconSize.md} color={colors.border} />
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
