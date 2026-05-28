import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/utils/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';

interface EmptyCartMessageProps {
  message?: string;
}

export const EmptyCartMessage = ({ message }: EmptyCartMessageProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <AppIcon name="carrito" size={48} color={colors.secondary} />
      </View>
      <AppText variant="H2" style={styles.title}>
        {message || t('home.emptyCart')}
      </AppText>
      <AppText variant="Body" style={styles.subtitle}>
        {t('home.emptyCartSubtitle')}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 1.5,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
});

export default EmptyCartMessage;
