import React from 'react';
import { StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';

type FormLabelProps = {
  children: string;
};

export function FormLabel({ children }: FormLabelProps): React.JSX.Element {
  return <AppText variant="Body" style={styles.label}>{children}</AppText>;
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
