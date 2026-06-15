import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing, touchTarget } from '@/constants/theme';
import { UserFriendlyError } from '@/types/errors';

type ErrorMessageProps = {
  message?: UserFriendlyError | string | null;
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

  const isUserFriendly =
    typeof message === 'object' && message !== null && 'title' in message && 'message' in message;

  return (
    <View style={styles.card} accessibilityRole="alert">
      <View style={styles.textContainer}>
        {isUserFriendly ? (
          <>
            <Text style={[styles.text, styles.titleText]}>
              {(message as UserFriendlyError).title}
            </Text>
            <Text style={styles.descriptionText}>{(message as UserFriendlyError).message}</Text>
          </>
        ) : (
          <Text style={styles.text}>{message as string}</Text>
        )}
      </View>
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
  textContainer: {
    flex: 1,
  },
  text: {
    color: colors.error,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  titleText: {
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  descriptionText: {
    color: colors.error,
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
