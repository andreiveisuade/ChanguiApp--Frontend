import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import ChanguiAppLogo from '@/../assets/logos/changuiapp-logo.svg';
import GoogleSignInButton from '@/components/buttons/GoogleSignInButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import TextLinkButton from '@/components/buttons/TextLinkButton';
import EmailInput from '@/components/forms/EmailInput';
import PasswordInput from '@/components/forms/PasswordInput';
import ErrorMessage from '@/components/feedback/ErrorMessage';
import AuthContainer from '@/components/layout/AuthContainer';
import useAuth from '@/viewmodels/useAuth';
import { colors, fonts, radii, spacing, touchTarget } from '@/utils/theme';
import { isValidEmail } from '@/utils/validators';

export function LoginScreen(): React.JSX.Element {
  const router = useRouter();
  const { t } = useTranslation();
  const { error, isLoading, login, loginWithGoogle, clearError } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const isSubmitDisabled = useMemo(
    () => !isValidEmail(email) || password.length === 0 || isLoading,
    [email, isLoading, password],
  );

  const handleLogin = async (): Promise<void> => {
    try {
      await login(email, password);
      router.replace('/(tabs)/home');
    } catch {
      return;
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      await loginWithGoogle();
      router.replace('/(tabs)/home');
    } catch {
      return;
    }
  };

  return (
    <AuthContainer>
      <View style={styles.hero}>
        <Text style={styles.title}>{t('auth.login.welcomeTitle')}</Text>
        <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>
      </View>
      <View style={styles.logo}>
        <ChanguiAppLogo accessible={false} fill={colors.white} height={80} width={80} />
      </View>
      <ErrorMessage
        closeAccessibilityHint={t('auth.accessibility.dismissError')}
        message={error?.message}
        onClose={clearError}
      />
      <EmailInput
        accessibilityLabel={t('auth.common.emailLabel')}
        error={error?.field === 'email' ? error.message : null}
        invalidEmailMessage={t('auth.errors.invalidEmail')}
        label={t('auth.common.emailLabel')}
        onChangeText={setEmail}
        placeholder={t('auth.common.emailPlaceholder')}
        value={email}
      />
      <PasswordInput
        accessibilityLabel={t('auth.login.password')}
        error={error?.field === 'password' ? error.message : null}
        hidePasswordLabel={t('auth.common.hidePassword')}
        label={t('auth.login.password')}
        onChangeText={setPassword}
        showPasswordLabel={t('auth.common.showPassword')}
        value={password}
      />
      <View style={styles.optionsRow}>
        <Pressable
          accessibilityHint={t('auth.login.rememberMe')}
          accessibilityRole="button"
          onPress={() => setRememberMe((currentValue) => !currentValue)}
          style={styles.rememberButton}
        >
          <View style={[styles.checkbox, rememberMe ? styles.checkboxActive : null]}>
            {rememberMe ? <Feather color={colors.white} name="check" size={14} /> : null}
          </View>
          <Text style={styles.rememberText}>{t('auth.login.rememberMe')}</Text>
        </Pressable>
        <TextLinkButton
          accessibilityHint={t('auth.accessibility.goToForgotPasswordHint')}
          onPress={() => router.push('/auth/forgot-password')}
          title={t('auth.login.forgotPassword')}
        />
      </View>
      <PrimaryButton
        accessibilityHint={t('auth.accessibility.loginHint')}
        disabled={isSubmitDisabled}
        isLoading={isLoading}
        onPress={handleLogin}
        title={t('auth.login.submit')}
      />
      <View style={styles.buttonGap} />
      <SecondaryButton
        accessibilityHint={t('auth.accessibility.goToRegisterHint')}
        disabled={isLoading}
        onPress={() => router.push('/auth/register')}
        title={t('auth.login.createAccount')}
      />
      <View style={styles.buttonGap} />
      <GoogleSignInButton
        accessibilityHint={t('auth.accessibility.googleHint')}
        disabled={isLoading}
        onPress={handleGoogleLogin}
        title={t('auth.login.google')}
      />
      {__DEV__ && (
        <Pressable
          onPress={async () => {
            await AsyncStorage.clear();
            router.replace('/');
          }}
          style={styles.devReset}
        >
          <Text style={styles.devResetText}>Reset app (DEV)</Text>
        </Pressable>
      )}
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
    lineHeight: 39,
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  logo: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: 24,
    height: 128,
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    width: 128,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  rememberButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberText: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  buttonGap: {
    height: spacing.md,
  },
  devReset: {
    alignItems: 'center',
    marginTop: spacing.xl,
    minHeight: touchTarget.minHeight,
    justifyContent: 'center',
  },
  devResetText: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 13,
  },
});

export default LoginScreen;
