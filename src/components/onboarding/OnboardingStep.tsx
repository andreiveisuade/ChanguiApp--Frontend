import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/utils/theme';

type OnboardingStepProps = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  text: string;
  width: number;
};

export function OnboardingStep({
  icon,
  title,
  text,
  width,
}: OnboardingStepProps): React.JSX.Element {
  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.iconCircle}>
        <Feather color={colors.white} name={icon} size={42} />
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
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  text: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 320,
    textAlign: 'center',
  },
});

export default OnboardingStep;
