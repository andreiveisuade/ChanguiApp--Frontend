import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';

type InlineErrorProps = {
  message?: string | null;
};

export function InlineError({ message }: InlineErrorProps): React.JSX.Element | null {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.icon}>!</Text>
      <Text style={styles.message}>{message}</Text>
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
    fontSize: 13,
    fontWeight: '800',
  },
  message: {
    color: colors.error,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default InlineError;
