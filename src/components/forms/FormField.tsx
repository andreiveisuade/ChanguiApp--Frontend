import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '@/constants/theme';
import { FormLabel } from '@/components/forms/FormLabel';
import { InlineError } from '@/components/forms/InlineError';

interface FormFieldProps {
  label: string;
  error?: string | null;
  children: React.ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps): React.JSX.Element {
  return (
    <View style={styles.wrapper}>
      <FormLabel>{label}</FormLabel>
      {children}
      {error ? <InlineError message={error} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
});

export default FormField;
