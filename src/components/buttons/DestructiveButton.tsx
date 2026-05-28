import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii, touchTarget } from '@/utils/theme';

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
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  text: {
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DestructiveButton;
