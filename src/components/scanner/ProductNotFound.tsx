import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/utils/theme';
import { AppText } from '@/components/atoms/AppText';
import SecondaryButton from '@/components/buttons/SecondaryButton';

interface ProductNotFoundProps {
  onRetry: () => void;
}

export function ProductNotFound({ onRetry }: ProductNotFoundProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Feather name="alert-circle" size={40} color={colors.error} />
      </View>
      <AppText variant="H2" style={styles.centered}>{t('scanner.productNotFound')}</AppText>
      <AppText variant="Body" style={styles.centered}>{t('scanner.productNotFoundSubtitle')}</AppText>
      <SecondaryButton
        title={t('scanner.tryAgain')}
        accessibilityHint={t('scanner.tryAgain')}
        onPress={onRetry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    textAlign: 'center',
  },
});

export default ProductNotFound;
