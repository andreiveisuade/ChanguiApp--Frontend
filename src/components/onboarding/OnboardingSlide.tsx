import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '@/components/atoms/AppIcon';
import { colors, fonts, fontSize, iconSize, spacing } from '@/constants/theme';

type OnboardingSlideProps = {
  icon: string;
  title: string;
  text: string;
  width: number;
};

export function OnboardingSlide({
  icon,
  title,
  text,
  width,
}: OnboardingSlideProps): React.JSX.Element {
  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.iconCircle}>
        <AppIcon color={colors.white} name={icon} size={iconSize.xxxxl} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    width: 96,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: fontSize.greeting,
    fontWeight: '800',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  text: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: fontSize.h3,
    lineHeight: 26,
    maxWidth: 320,
    textAlign: 'center',
  },
});

export default OnboardingSlide;
