import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

type SuccessMessageProps = {
  message?: string | null;
};

export function SuccessMessage({ message }: SuccessMessageProps): React.JSX.Element | null {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.successSurface,
    borderColor: colors.success,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  text: {
    color: colors.success,
    fontFamily: fonts.body,
    fontSize: fontSize.body,
    lineHeight: 20,
  },
});

export default SuccessMessage;
