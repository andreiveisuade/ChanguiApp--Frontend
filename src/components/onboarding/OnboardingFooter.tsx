import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import OnboardingDots from '@/components/onboarding/OnboardingDots';
import { spacing } from '@/utils/theme';

type OnboardingFooterProps = {
  isLast: boolean;
  current: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
};

export function OnboardingFooter({
  isLast,
  current,
  total,
  onNext,
}: OnboardingFooterProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <OnboardingDots current={current} total={total} />
      <PrimaryButton
        accessibilityHint={isLast ? t('onboarding.finish') : t('onboarding.next')}
        onPress={onNext}
        title={isLast ? t('onboarding.finish') : t('onboarding.next')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
});

export default OnboardingFooter;
