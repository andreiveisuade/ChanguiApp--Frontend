import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import ChanguiAppLogo from '@/../assets/logos/changuiapp-logo.svg';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';

export function SplashSlide(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.logoCircle}>
          <ChanguiAppLogo accessible={false} fill={colors.primary} height={64} width={64} />
        </View>
        <Text style={styles.title}>{t('app_name')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.splash.tagline')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 58,
    height: 116,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: 116,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: fontSize.display,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: fontSize.h2,
  },
});

export default SplashSlide;
