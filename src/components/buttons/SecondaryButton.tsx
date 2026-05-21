import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii, touchTarget } from '@/utils/theme';

type SecondaryButtonProps = {
  title: string;
  accessibilityHint: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
};

export function SecondaryButton({
  title,
  accessibilityHint,
  onPress,
  disabled = false,
  isLoading = false,
}: SecondaryButtonProps): React.JSX.Element {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isDisabled ? styles.buttonDisabled : null,
        pressed ? styles.buttonPressed : null,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 56,
    minWidth: touchTarget.minWidth,
    paddingHorizontal: 18,
  },
  buttonDisabled: {
    opacity: 0.58,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  text: {
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SecondaryButton;
