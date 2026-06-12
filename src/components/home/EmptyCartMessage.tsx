import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';

export const EmptyCartMessage = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <AppIcon name="carrito" size={56} color={colors.secondary} />
      </View>
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
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    textAlign: 'center',
  },
});

export default EmptyCartMessage;
