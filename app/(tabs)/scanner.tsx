import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/atoms/AppText';
import { colors } from '@/utils/theme';

export default function ScannerScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <AppText variant="H1">{t('nav.scanner')}</AppText>
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
