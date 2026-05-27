import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, fonts, spacing } from '@/utils/theme';
import { AppText } from '@/components/atoms/AppText';

interface EmptyCartMessageProps {
  message?: string;
}

export const EmptyCartMessage = ({ message }: EmptyCartMessageProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Feather name="shopping-cart" size={48} color="rgba(208, 73, 70, 0.2)" />
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
    backgroundColor: 'rgba(208, 73, 70, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default EmptyCartMessage;
