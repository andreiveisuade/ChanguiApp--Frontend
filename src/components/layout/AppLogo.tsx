import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/utils/theme';

type AppLogoProps = {
  title: string;
};

export function AppLogo({ title }: AppLogoProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <Text style={styles.markText}>C</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  mark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  markText: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '800',
  },
  title: {
    color: colors.primary,
    fontFamily: fonts.display,
    fontSize: 34,
    fontWeight: '800',
  },
});

export default AppLogo;
