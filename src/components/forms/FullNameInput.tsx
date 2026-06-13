import React, { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import FormLabel from '@/components/forms/FormLabel';
import InlineError from '@/components/forms/InlineError';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { isValidFullName } from '@/utils/validators';

type FullNameInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  label: string;
  accessibilityLabel: string;
  nameTooShortMessage: string;
  error?: string | null;
};

export function FullNameInput({
  value,
  onChangeText,
  label,
  accessibilityLabel,
  nameTooShortMessage,
  error,
}: FullNameInputProps): React.JSX.Element {
  const [touched, setTouched] = useState<boolean>(false);
  const validationError = useMemo(
    () => (touched && value.length > 0 && !isValidFullName(value) ? nameTooShortMessage : null),
    [nameTooShortMessage, touched, value],
  );
  const displayError = error ?? validationError;

  return (
    <View style={styles.container}>
      <FormLabel>{label}</FormLabel>
      <View style={[styles.inputWrapper, displayError ? styles.inputWrapperError : null]}>
        <TextInput
          accessibilityLabel={accessibilityLabel}
          autoCapitalize="words"
          autoCorrect={false}
          onBlur={() => setTouched(true)}
          onChangeText={onChangeText}
          style={styles.input}
          textContentType="name"
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

export default FullNameInput;
