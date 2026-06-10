import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radii, spacing, touchTarget } from '@/constants/theme';
import { UserFriendlyError } from '@/types/errors';
import { AppIcon } from '@/components/atoms/AppIcon';

type ErrorAlertProps = {
  error: UserFriendlyError | null;
  onAction?: () => void;
  onDismiss?: () => void;
};

export const ErrorAlert = ({
  error,
  onAction,
  onDismiss,
}: ErrorAlertProps): React.JSX.Element | null => {
  if (!error) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={styles.contentRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{error.title}</Text>
          <Text style={styles.message}>{error.message}</Text>
        </View>

        {onDismiss && (
          <Pressable
            accessibilityLabel="Cerrar alerta"
            accessibilityRole="button"
            onPress={onDismiss}
            style={styles.closeButton}
            hitSlop={8}
          >
            <AppIcon name="cerrar" size={20} color={colors.error} />
          </Pressable>
        )}
      </View>

      {error.actionLabel && onAction && (
        <Pressable
          accessibilityLabel={error.actionLabel}
          accessibilityRole="button"
          onPress={onAction}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>{error.actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.errorSurface, // #FFD1D0
    borderColor: colors.error, // #C1121F
    borderWidth: 1,
    borderRadius: radii.md, // 12
    padding: spacing.md, // 12
    marginBottom: spacing.md, // 12
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#C1121F', // colors.error
    marginBottom: spacing.xs,
  },
  message: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#C1121F', // colors.error for readability and WCAG AA contrast (6.5:1 on #FFD1D0)
    lineHeight: 20,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget.minHeight, // 44
    minWidth: touchTarget.minWidth, // 44
  },
  actionButton: {
    backgroundColor: '#C1121F', // #C1121F
    borderRadius: radii.sm, // 8
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget.minHeight, // 44
  },
  actionText: {
    fontFamily: 'Inter-Bold',
    color: colors.white, // #FFFFFF
    fontSize: 14,
  },
});

export default ErrorAlert;
