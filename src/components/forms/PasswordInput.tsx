import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppIcon } from '@/components/atoms/AppIcon';
import FormLabel from '@/components/forms/FormLabel';
import InlineError from '@/components/forms/InlineError';
import PasswordStrengthIndicator from '@/components/forms/PasswordStrengthIndicator';
import { colors, fonts, radii, spacing, touchTarget } from '@/constants/theme';

type PasswordInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  label: string;
  accessibilityLabel: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  error?: string | null;
  showStrength?: boolean;
  strengthLabels?: {
    weak: string;
    medium: string;
    strong: string;
  };
};

export function PasswordInput({
  value,
  onChangeText,
  label,
  accessibilityLabel,
  showPasswordLabel,
  hidePasswordLabel,
  error,
  showStrength = false,
  strengthLabels,
}: PasswordInputProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  return (
    <View style={styles.container}>
      <FormLabel>{label}</FormLabel>
      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
        <TextInput
          accessibilityLabel={accessibilityLabel}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeText}
          secureTextEntry={!isVisible}
          style={styles.input}
          textContentType="password"
          value={value}
        />
        <Pressable
          accessibilityHint={isVisible ? hidePasswordLabel : showPasswordLabel}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => setIsVisible((currentValue) => !currentValue)}
          style={styles.toggle}
        >
          <AppIcon
            color={colors.textSecondary}
            name={isVisible ? 'ocultar' : 'ver'}
            size={22}
          />
        </Pressable>
      </View>
      {showStrength && strengthLabels ? (
        <PasswordStrengthIndicator labels={strengthLabels} password={value} />
      ) : null}
      <InlineError message={error} />
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
    fontSize: 16,
    minHeight: 54,
  },
  toggle: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
  },
});

export default PasswordInput;
