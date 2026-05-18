import React, { useMemo } from 'react';
import PasswordInput from '@/components/forms/PasswordInput';
import { doPasswordsMatch } from '@/utils/validators';

type ConfirmPasswordInputProps = {
  value: string;
  password: string;
  onChangeText: (value: string) => void;
  label: string;
  accessibilityLabel: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  mismatchMessage: string;
  error?: string | null;
};

export function ConfirmPasswordInput({
  value,
  password,
  onChangeText,
  label,
  accessibilityLabel,
  showPasswordLabel,
  hidePasswordLabel,
  mismatchMessage,
  error,
}: ConfirmPasswordInputProps): React.JSX.Element {
  const validationError = useMemo(
    () => (value.length > 0 && !doPasswordsMatch(password, value) ? mismatchMessage : null),
    [mismatchMessage, password, value],
  );

  return (
    <PasswordInput
      accessibilityLabel={accessibilityLabel}
      error={error ?? validationError}
      hidePasswordLabel={hidePasswordLabel}
      label={label}
      onChangeText={onChangeText}
      showPasswordLabel={showPasswordLabel}
      value={value}
    />
  );
}

export default ConfirmPasswordInput;
