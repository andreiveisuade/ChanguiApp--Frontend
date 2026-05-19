import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import GoogleColorIcon from '@/../assets/icons/google-color.svg';
import { colors, fonts, radii, spacing, touchTarget } from '@/utils/theme';

type GoogleSignInButtonProps = {
  title: string;
  accessibilityHint: string;
  onPress: () => void;
  disabled?: boolean;
};

export function GoogleSignInButton({
  title,
  accessibilityHint,
  onPress,
  disabled = false,
}: GoogleSignInButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled ? styles.buttonDisabled : null,
        pressed ? styles.buttonPressed : null,
      ]}
    >
      <GoogleColorIcon accessible={false} height={24} width={24} />
      <Text style={styles.text}>{title}</Text>
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
    flexDirection: 'row',
    gap: spacing.md,
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
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleSignInButton;
