import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/atoms/AppIcon';
import { colors, fonts, radii, spacing, touchTarget } from '@/constants/theme';

interface QuantitySelectorProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
}: QuantitySelectorProps): React.JSX.Element {
  const { t } = useTranslation();
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onDecrement}
        disabled={!canDecrement}
        accessibilityLabel={t('common.decrementQuantity')}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.button,
          !canDecrement && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <AppIcon
          name="menos"
          size={20}
          color={canDecrement ? colors.primary : colors.textSecondary}
        />
      </Pressable>

      <Text style={styles.value} accessibilityLabel={t('common.quantityValue', { value })}>
        {value}
      </Text>

      <Pressable
        onPress={onIncrement}
        disabled={!canIncrement}
        accessibilityLabel={t('common.incrementQuantity')}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.button,
          !canIncrement && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <AppIcon
          name="mas"
          size={20}
          color={canIncrement ? colors.primary : colors.textSecondary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
    paddingHorizontal: spacing.sm,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.6,
  },
  value: {
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'center',
  },
});

export default QuantitySelector;
