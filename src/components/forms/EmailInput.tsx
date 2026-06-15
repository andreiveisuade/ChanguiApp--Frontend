import React, { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import FormLabel from '@/components/forms/FormLabel';
import InlineError from '@/components/forms/InlineError';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { isValidEmail } from '@/utils/validators';

type EmailInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  label: string;
  placeholder: string;
  accessibilityLabel: string;
  invalidEmailMessage: string;
  error?: string | null;
};

export function EmailInput({
  value,
  onChangeText,
  label,
  placeholder,
  accessibilityLabel,
  invalidEmailMessage,
  error,
}: EmailInputProps): React.JSX.Element {
  const [touched, setTouched] = useState<boolean>(false);
  const validationError = useMemo(
    () => (touched && value.length > 0 && !isValidEmail(value) ? invalidEmailMessage : null),
    [invalidEmailMessage, touched, value],
  );

  const displayError = error ?? validationError;

  return (
    <View style={styles.container}>
      <FormLabel>{label}</FormLabel>
      <View style={[styles.inputWrapper, displayError ? styles.inputWrapperError : null]}>
        <TextInput
          accessibilityLabel={accessibilityLabel}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onBlur={() => setTouched(true)}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          textContentType="emailAddress"
          value={value}
        />
      </View>
      <InlineError message={displayError} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  inputWrapper: {
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderColor: colors.inputBackground,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.input,
    minHeight: 54,
  },
});

export default EmailInput;
