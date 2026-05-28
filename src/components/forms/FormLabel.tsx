import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';

type FormLabelProps = {
  children: string;
};

export function FormLabel({ children }: FormLabelProps): React.JSX.Element {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
});

export default FormLabel;
