import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {icon ? (
        <View style={styles.iconCircle}>
          <AppIcon name={icon} size={40} color={colors.textSecondary} />
        </View>
      ) : null}
      <AppText variant="H2" style={styles.centered}>
        {title ?? t('common.emptyTitle')}
      </AppText>
      {subtitle ? (
        <AppText variant="Body" style={styles.centered}>
          {subtitle}
        </AppText>
      ) : null}
      {action ?? null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  centered: {
    textAlign: 'center',
  },
});

export default EmptyState;
