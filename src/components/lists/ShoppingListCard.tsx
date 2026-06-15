import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShoppingList } from '@/types/domain';
import {
  colors,
  elevation,
  iconSize,
  opacity,
  radii,
  shadow,
  sizes,
  spacing,
  touchTarget,
} from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';

interface ShoppingListCardProps {
  list: ShoppingList;
  onPress: () => void;
  onLongPress?: () => void;
}

export function ShoppingListCard({
  list,
  onPress,
  onLongPress,
}: ShoppingListCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const progress =
    list.total_items > 0 ? list.done_items / list.total_items : 0;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityLabel={list.name}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <AppIcon name="lista" size={iconSize.md} color={colors.primary} />
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
    elevation: elevation.card,
    gap: spacing.sm,
    minHeight: touchTarget.minHeight,
    padding: spacing.lg,
    ...shadow.card,
  },
  pressed: {
    opacity: opacity.pressed,
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
    borderRadius: radii.xs,
    height: sizes.progressBarHeight,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.success,
    borderRadius: radii.xs,
    height: '100%',
  },
});

export default ShoppingListCard;
