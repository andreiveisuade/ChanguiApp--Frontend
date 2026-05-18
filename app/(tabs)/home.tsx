import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import LoadingOverlay from '@/components/feedback/LoadingOverlay';
import useAuth from '@/viewmodels/useAuth';
import { colors, fonts, spacing } from '@/utils/theme';

export default function HomeRoute(): React.JSX.Element {
  const router = useRouter();
  const { t } = useTranslation();
  const { isLoading, logout, user } = useAuth();

  const handleLogout = async (): Promise<void> => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.title')}</Text>
      <Text style={styles.subtitle}>
        {user?.full_name ? t('home.greeting', { name: user.full_name }) : t('home.placeholder')}
      </Text>
      <PrimaryButton
        accessibilityHint={t('auth.accessibility.logoutHint')}
        isLoading={isLoading}
        onPress={handleLogout}
        title={t('logout')}
      />
      <LoadingOverlay visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
});
