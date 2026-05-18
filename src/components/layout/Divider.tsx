import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/utils/theme';

type DividerProps = {
  label: string;
};

export function Divider({ label }: DividerProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  line: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1,
  },
  label: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Divider;
