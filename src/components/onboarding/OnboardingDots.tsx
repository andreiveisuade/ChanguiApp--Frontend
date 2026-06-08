import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '@/constants/theme';

type OnboardingDotsProps = {
  total: number;
  current: number;
  variant?: 'light' | 'primary';
};

export function OnboardingDots({
  total,
  current,
  variant = 'primary',
}: OnboardingDotsProps): React.JSX.Element {
  return (
    <View style={styles.container} accessibilityElementsHidden>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current;
        const activeStyle = variant === 'light' ? styles.lightActiveDot : styles.primaryActiveDot;
        const inactiveStyle =
          variant === 'light' ? styles.lightInactiveDot : styles.primaryInactiveDot;

        return <View key={index} style={[styles.dot, isActive ? activeStyle : inactiveStyle]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  dot: {
    borderRadius: radii.sm,
    height: 8,
  },
  lightActiveDot: {
    backgroundColor: colors.white,
    width: 32,
  },
  lightInactiveDot: {
    backgroundColor: colors.splashDotInactive,
    width: 8,
  },
  primaryActiveDot: {
    backgroundColor: colors.primary,
    width: 32,
  },
  primaryInactiveDot: {
    backgroundColor: colors.onboardingDotInactive,
    width: 8,
  },
});

export default OnboardingDots;
