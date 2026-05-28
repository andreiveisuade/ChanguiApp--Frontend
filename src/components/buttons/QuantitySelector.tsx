import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radii, spacing, touchTarget } from '@/utils/theme';

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
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onDecrement}
        disabled={!canDecrement}
        accessibilityLabel="Reducir cantidad"
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.button,
          !canDecrement && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Feather
          name="minus"
          size={18}
          color={canDecrement ? colors.primary : colors.textSecondary}
        />
      </Pressable>

      <Text style={styles.value} accessibilityLabel={`Cantidad: ${value}`}>
        {value}
      </Text>

      <Pressable
        onPress={onIncrement}
        disabled={!canIncrement}
        accessibilityLabel="Aumentar cantidad"
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.button,
          !canIncrement && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Feather
          name="plus"
          size={18}
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
