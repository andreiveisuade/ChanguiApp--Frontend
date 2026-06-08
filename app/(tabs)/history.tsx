import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/atoms/AppText';
import { colors } from '@/constants/theme';

export default function HistoryScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <AppText variant="H1">{t('nav.history')}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
