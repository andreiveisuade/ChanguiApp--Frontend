import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import { AppText } from '@/components/atoms/AppText';
import { spacing } from '@/utils/theme';

interface SectionTitleProps {
  title: string;
  style?: StyleProp<TextStyle>;
}

export function SectionTitle({ title, style }: SectionTitleProps): React.JSX.Element {
  return (
    <AppText variant="H2" style={[styles.title, style]}>
      {title}
    </AppText>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.sm,
  },
});

export default SectionTitle;
