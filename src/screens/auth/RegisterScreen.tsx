import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import TextLinkButton from '@/components/buttons/TextLinkButton';
import ConfirmPasswordInput from '@/components/forms/ConfirmPasswordInput';
import EmailInput from '@/components/forms/EmailInput';
import FullNameInput from '@/components/forms/FullNameInput';
import PasswordInput from '@/components/forms/PasswordInput';
import ErrorMessage from '@/components/feedback/ErrorMessage';
import AuthContainer from '@/components/layout/AuthContainer';
import useAuth from '@/viewmodels/useAuth';
import { colors, fonts, spacing } from '@/utils/theme';
import { ROUTES } from '@/constants/routes';
import {
  doPasswordsMatch,
  isValidEmail,
  isValidFullName,
  isValidPassword,
} from '@/utils/validators';

export function RegisterScreen(): React.JSX.Element {
  const router = useRouter();
  const { t } = useTranslation();
  const { error, isLoading, register, clearError } = useAuth();
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const localErrors = useMemo(
    () => ({
      fullName:
        fullName.length > 0 && !isValidFullName(fullName) ? t('auth.errors.nameTooShort') : null,
      email: email.length > 0 && !isValidEmail(email) ? t('auth.errors.invalidEmail') : null,
      password:
        password.length > 0 && !isValidPassword(password)
          ? t('auth.errors.passwordTooShort')
          : null,
      confirmPassword:
        confirmPassword.length > 0 && !doPasswordsMatch(password, confirmPassword)
          ? t('auth.errors.passwordMismatch')
          : null,
    }),
    [confirmPassword, email, fullName, password, t],
  );

  const isSubmitDisabled = useMemo(
    () =>
      !isValidFullName(fullName) ||
      !isValidEmail(email) ||
      !isValidPassword(password) ||
      !doPasswordsMatch(password, confirmPassword) ||
      isLoading,
    [confirmPassword, email, fullName, isLoading, password],
  );

  const handleRegister = async (): Promise<void> => {
    try {
      await register({
        full_name: fullName,
        email,
        password,
        confirmPassword,
      });
      router.replace(ROUTES.home);
    } catch {
      return;
    }
  };

  return (
    <AuthContainer>
      <View style={styles.hero}>
        <Text style={styles.title}>{t('auth.register.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>
      </View>
      <ErrorMessage
        closeAccessibilityHint={t('auth.accessibility.dismissError')}
        message={error?.message}
        onClose={clearError}
      />
      <FullNameInput
        accessibilityLabel={t('auth.register.fullName')}
        error={error?.field === 'full_name' ? error.message : localErrors.fullName}
        label={t('auth.register.fullName')}
        nameTooShortMessage={t('auth.errors.nameTooShort')}
        onChangeText={setFullName}
        value={fullName}
      />
      <EmailInput
        accessibilityLabel={t('auth.common.emailLabel')}
        error={error?.field === 'email' ? error.message : localErrors.email}
        invalidEmailMessage={t('auth.errors.invalidEmail')}
        label={t('auth.common.emailLabel')}
        onChangeText={setEmail}
        placeholder={t('auth.common.emailPlaceholder')}
        value={email}
      />
      <PasswordInput
        accessibilityLabel={t('auth.register.password')}
        error={error?.field === 'password' ? error.message : localErrors.password}
        hidePasswordLabel={t('auth.common.hidePassword')}
        label={t('auth.register.password')}
        onChangeText={setPassword}
        showPasswordLabel={t('auth.common.showPassword')}
        showStrength
        strengthLabels={{
          weak: t('auth.passwordStrength.weak'),
          medium: t('auth.passwordStrength.medium'),
          strong: t('auth.passwordStrength.strong'),
        }}
        value={password}
      />
      <ConfirmPasswordInput
        accessibilityLabel={t('auth.register.confirmPassword')}
        error={error?.field === 'confirmPassword' ? error.message : localErrors.confirmPassword}
        hidePasswordLabel={t('auth.common.hidePassword')}
        label={t('auth.register.confirmPassword')}
        mismatchMessage={t('auth.errors.passwordMismatch')}
        onChangeText={setConfirmPassword}
        password={password}
        showPasswordLabel={t('auth.common.showPassword')}
        value={confirmPassword}
      />
      <PrimaryButton
        accessibilityHint={t('auth.accessibility.registerHint')}
        disabled={isSubmitDisabled}
        isLoading={isLoading}
        onPress={handleRegister}
        title={t('auth.register.submit')}
      />
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('auth.register.hasAccount')}</Text>
        <TextLinkButton
          accessibilityHint={t('auth.accessibility.goToLoginHint')}
          onPress={() => router.push(ROUTES.auth.login)}
          title={t('auth.register.login')}
        />
      </View>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 15,
  },
});

export default RegisterScreen;
