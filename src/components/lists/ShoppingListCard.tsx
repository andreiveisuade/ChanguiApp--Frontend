import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShoppingList } from '@/types/domain';
import { colors, radii, spacing, touchTarget } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';

interface ShoppingListCardProps {
  list: ShoppingList;
  onPress: () => void;
}

export function ShoppingListCard({
  list,
  onPress,
}: ShoppingListCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const progress =
    list.total_items > 0 ? list.done_items / list.total_items : 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={list.name}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <AppIcon name="lista" size={22} color={colors.primary} />
        <AppText variant="H3" style={styles.name} numberOfLines={1}>
          {list.name}
        </AppText>
      </View>
      <AppText variant="Body">
        {t('lists.progress', { done: list.done_items, total: list.total_items })}
      </AppText>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round(progress * 100)}%` },
          ]}
        />
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
    minHeight: touchTarget.minHeight,
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
  },
  name: {
    flex: 1,
    textTransform: 'none',
  },
  progressBar: {
    backgroundColor: colors.border,
    borderRadius: 2,
    height: 4,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.success,
    borderRadius: 2,
    height: '100%',
  },
});

export default ShoppingListCard;
