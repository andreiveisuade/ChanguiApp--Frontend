import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import OnboardingDots from '@/components/onboarding/OnboardingDots';
import { colors, fonts, radii, spacing, touchTarget } from '@/utils/theme';

type SplashSlideProps = {
  onNext: () => void;
};

export function SplashSlide({ onNext }: SplashSlideProps): React.JSX.Element {
  const { t } = useTranslation();
  const hasAdvanced = useRef<boolean>(false);

  const handleNext = useCallback((): void => {
    if (hasAdvanced.current) {
      return;
    }

    hasAdvanced.current = true;
    onNext();
  }, [onNext]);

  useEffect(() => {
    const timeout = setTimeout(handleNext, 3000);

    return () => clearTimeout(timeout);
  }, [handleNext]);

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.logoCircle}>
          <Feather color={colors.primary} name="shopping-cart" size={58} />
        </View>
        <Text style={styles.title}>{t('app_name')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.splash.tagline')}</Text>
        <View style={styles.dots}>
          <OnboardingDots current={0} total={3} variant="light" />
        </View>
      </View>
      <Pressable
        accessibilityHint={t('onboarding.splash.cta')}
        accessibilityRole="button"
        onPress={handleNext}
        style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
      >
        <Text style={styles.buttonText}>{t('onboarding.splash.cta')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: 120,
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
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
    fontSize: 36,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 18,
  },
  dots: {
    marginTop: spacing.xxl,
  },
  button: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: 56,
    minWidth: touchTarget.minWidth,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default SplashSlide;
