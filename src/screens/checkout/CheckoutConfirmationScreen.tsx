import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { SecondaryButton } from '@/components/buttons/SecondaryButton';
import { colors, spacing } from '@/constants/theme';
import { ROUTES } from '@/constants/routes';
import useCheckoutStatus, { CheckoutStatus } from '@/viewmodels/useCheckoutStatus';

const ICON_BY_STATUS: Record<Exclude<CheckoutStatus, 'checking'>, { name: string; color: string }> = {
  success: { name: 'exito', color: colors.success },
  pending: { name: 'alerta', color: colors.warning },
  timeout: { name: 'error', color: colors.error },
};

export default function CheckoutConfirmationScreen(): React.JSX.Element | null {
  const { t } = useTranslation();
  const router = useRouter();
  const { preferenceId } = useLocalSearchParams<{ preferenceId?: string }>();
  const { status, retry } = useCheckoutStatus(preferenceId ?? '');

  const goHistory = () => router.replace(ROUTES.tabs.history);
  const goHome = () => router.replace(ROUTES.tabs.home);
  const goCart = () => router.replace(ROUTES.tabs.cart);

  // Sin preferenceId no hay nada que confirmar: evitamos 60s de requests inválidas
  // y volvemos al home.
  React.useEffect(() => {
    if (!preferenceId) {
      router.replace(ROUTES.tabs.home);
    }
  }, [preferenceId, router]);

  if (!preferenceId) {
    return null;
  }

  if (status === 'checking') {
    return (
      <ScreenWrapper style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="H2" style={styles.title}>
          {t('checkout.confirmingTitle')}
        </AppText>
        <AppText variant="Body" style={styles.subtitle}>
          {t('checkout.confirmingSubtitle')}
        </AppText>
      </ScreenWrapper>
    );
  }

  const icon = ICON_BY_STATUS[status];

  return (
    <ScreenWrapper style={styles.centered}>
      <AppIcon name={icon.name} size={72} color={icon.color} />
      <AppText variant="H1" style={styles.title}>
        {t(`checkout.${status}Title`)}
      </AppText>
      <AppText variant="Body" style={styles.subtitle}>
        {t(`checkout.${status}Subtitle`)}
      </AppText>

      <View style={styles.actions}>
        {status === 'timeout' ? (
          <>
            <PrimaryButton
              title={t('checkout.retry')}
              accessibilityHint={t('checkout.retryHint')}
              onPress={retry}
            />
            <SecondaryButton
              title={t('checkout.backToCart')}
              accessibilityHint={t('checkout.backToCartHint')}
              onPress={goCart}
            />
          </>
        ) : (
          <>
            <PrimaryButton
              title={t('checkout.viewHistory')}
              accessibilityHint={t('checkout.viewHistoryHint')}
              onPress={goHistory}
            />
            <SecondaryButton
              title={t('checkout.goHome')}
              accessibilityHint={t('checkout.goHomeHint')}
              onPress={goHome}
            />
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  actions: {
    marginTop: spacing.xl,
    alignSelf: 'stretch',
    gap: spacing.md,
  },
});
