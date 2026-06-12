import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, fontSize, opacity, radii, touchTarget } from '@/constants/theme';

type DestructiveButtonProps = {
  title: string;
  accessibilityHint: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
};

export function DestructiveButton({
  title,
  accessibilityHint,
  onPress,
  disabled = false,
  isLoading = false,
}: DestructiveButtonProps): React.JSX.Element {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: 56,
    minWidth: touchTarget.minWidth,
    paddingHorizontal: 18,
  },
  buttonDisabled: {
    opacity: opacity.disabled,
  },
  buttonPressed: {
    opacity: opacity.pressed,
  },
  text: {
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: fontSize.button,
    fontWeight: '600',
  },
});

export default DestructiveButton;
