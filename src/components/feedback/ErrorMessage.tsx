import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing, touchTarget } from '@/utils/theme';

type ErrorMessageProps = {
  message?: string | null;
  closeAccessibilityHint: string;
  onClose: () => void;
};

export function ErrorMessage({
  message,
  closeAccessibilityHint,
  onClose,
}: ErrorMessageProps): React.JSX.Element | null {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.card} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
      <Pressable
        accessibilityHint={closeAccessibilityHint}
        accessibilityRole="button"
        hitSlop={8}
        onPress={onClose}
        style={styles.closeButton}
      >
        <Text style={styles.closeText}>X</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.errorSurface,
    borderColor: colors.error,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  text: {
    color: colors.error,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
  },
  closeText: {
    color: colors.error,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '800',
  },
});

export default ErrorMessage;
