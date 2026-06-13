import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';

type InlineErrorProps = {
  message?: string | null;
};

export function InlineError({ message }: InlineErrorProps): React.JSX.Element | null {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityRole="alert">
      <AppText variant="Body" style={styles.icon}>!</AppText>
      <AppText variant="Body" style={styles.message}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  icon: {
    color: colors.error,
    fontFamily: fonts.body,
    fontSize: fontSize.body,
    fontWeight: '800',
  },
  message: {
    color: colors.error,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.body,
    lineHeight: 18,
  },
});

export default InlineError;
