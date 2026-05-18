import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
      <View style={styles.googleMark} accessible={false}>
        <View style={[styles.googleQuadrant, styles.googleTopLeft]} />
        <View style={[styles.googleQuadrant, styles.googleTopRight]} />
        <View style={[styles.googleQuadrant, styles.googleBottomLeft]} />
        <View style={[styles.googleQuadrant, styles.googleBottomRight]} />
        <View style={styles.googleCenter}>
          <Text style={styles.googleLetter}>G</Text>
        </View>
      </View>
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
  googleMark: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 24,
  },
  googleQuadrant: {
    height: 12,
    position: 'absolute',
    width: 12,
  },
  googleTopLeft: {
    backgroundColor: colors.googleBlue,
    left: 0,
    top: 0,
  },
  googleTopRight: {
    backgroundColor: colors.googleRed,
    right: 0,
    top: 0,
  },
  googleBottomLeft: {
    backgroundColor: colors.googleYellow,
    bottom: 0,
    left: 0,
  },
  googleBottomRight: {
    backgroundColor: colors.googleGreen,
    bottom: 0,
    right: 0,
  },
  googleCenter: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 6,
    height: 12,
    justifyContent: 'center',
    width: 12,
  },
  googleLetter: {
    color: colors.googleBlue,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '800',
  },
  text: {
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleSignInButton;
