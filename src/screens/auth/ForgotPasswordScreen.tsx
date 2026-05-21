import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import FormLabel from '@/components/forms/FormLabel';
import AppHeader from '@/components/layout/AppHeader';
import AuthContainer from '@/components/layout/AuthContainer';
import useAuth from '@/viewmodels/useAuth';
import { colors, fonts, radii, spacing, touchTarget } from '@/utils/theme';

export function ForgotPasswordScreen(): React.JSX.Element {
  const router = useRouter();
  const { t } = useTranslation();
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [sent, setSent] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    const ok = await resetPassword(email);
    if (ok) {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <AuthContainer>
        <AppHeader />
        <View style={styles.mailCircle}>
          <Feather color={colors.mailIcon} name="mail" size={42} />
        </View>
        <View style={styles.hero}>
          <Text style={styles.title}>{t('forgotPassword.sentTitle')}</Text>
          <Text style={styles.subtitle}>{t('forgotPassword.sentMessage', { email })}</Text>
        </View>
        <PrimaryButton
          accessibilityHint={t('forgotPassword.back')}
          onPress={() => router.replace('/auth/login')}
          title={t('forgotPassword.back')}
        />
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <AppHeader />
      <Pressable
        accessibilityHint={t('forgotPassword.back')}
        accessibilityRole="button"
        onPress={() => router.replace('/auth/login')}
        style={styles.backLink}
      >
        <Feather color={colors.primary} name="arrow-left" size={18} />
        <Text style={styles.backText}>{t('forgotPassword.back')}</Text>
      </Pressable>
      <View style={styles.hero}>
        <Text style={styles.title}>{t('forgotPassword.title')}</Text>
        <Text style={styles.subtitle}>{t('forgotPassword.subtitle')}</Text>
      </View>
      <View style={styles.mailCircle}>
        <Feather color={colors.mailIcon} name="mail" size={42} />
      </View>
      <View style={styles.inputGroup}>
        <FormLabel>{t('forgotPassword.email')}</FormLabel>
        <TextInput
          accessibilityLabel={t('forgotPassword.email')}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder={t('auth.common.emailPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          textContentType="emailAddress"
          value={email}
        />
      </View>
      <PrimaryButton
        accessibilityHint={t('forgotPassword.submit')}
        disabled={isLoading}
        onPress={handleSubmit}
        title={isLoading ? t('forgotPassword.sending') : t('forgotPassword.submit')}
      />
      <Text style={styles.info}>{t('forgotPassword.info')}</Text>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  backLink: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
  },
  backText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '700',
  },
  hero: {
    marginTop: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  mailCircle: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.mailSurface,
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    marginVertical: spacing.xxl,
    width: 96,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: radii.md,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 16,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  info: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
