import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

type Strength = 'weak' | 'medium' | 'strong';

type PasswordStrengthIndicatorProps = {
  password: string;
  labels: Record<Strength, string>;
};

const getStrength = (password: string): Strength => {
  const hasLetters = /[A-Za-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  if (password.length >= 10 && hasLetters && hasNumbers && hasSymbols) {
    return 'strong';
  }

  if (password.length >= 6 && hasLetters && hasNumbers) {
    return 'medium';
  }

  return 'weak';
};

export function PasswordStrengthIndicator({
  password,
  labels,
}: PasswordStrengthIndicatorProps): React.JSX.Element {
  const strength = getStrength(password);
  const activeSegments = strength === 'strong' ? 3 : strength === 'medium' ? 2 : 1;

  return (
    <View style={styles.container} accessibilityLabel={labels[strength]}>
      <View style={styles.segments}>
        {[0, 1, 2].map((segment) => (
          <View
            key={segment}
            style={[
              styles.segment,
              segment < activeSegments ? styles.activeSegment : styles.inactiveSegment,
            ]}
          />
        ))}
      </View>
      <Text style={styles.label}>{labels[strength]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  segments: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    borderRadius: radii.sm,
    flex: 1,
    height: 5,
  },
  activeSegment: {
    backgroundColor: colors.success,
  },
  inactiveSegment: {
    backgroundColor: colors.border,
  },
  label: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: fontSize.label,
  },
});

export default PasswordStrengthIndicator;
