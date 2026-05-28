import React from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  View,
} from 'react-native';
import { colors, fonts, radii, spacing } from '@/utils/theme';
import { FormLabel } from '@/components/forms/FormLabel';
import { InlineError } from '@/components/forms/InlineError';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string | null;
}

export function TextInput({
  label,
  error,
  style,
  ...props
}: TextInputProps): React.JSX.Element {
  return (
    <View style={styles.wrapper}>
      {label ? <FormLabel>{label}</FormLabel> : null}
      <RNTextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
      {error ? <InlineError message={error} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderColor: 'transparent',
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 16,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: 0,
  },
  inputError: {
    borderColor: colors.error,
  },
});

export default TextInput;
