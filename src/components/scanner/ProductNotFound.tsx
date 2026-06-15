import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, iconSize } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import SecondaryButton from '@/components/buttons/SecondaryButton';

interface ProductNotFoundProps {
  onRetry: () => void;
}

export function ProductNotFound({ onRetry }: ProductNotFoundProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <AppIcon name="alerta" size={iconSize.xxxl} color={colors.error} />
      </View>
      <AppText variant="H2" style={styles.centered}>
        {t('scanner.productNotFound')}
      </AppText>
      <AppText variant="Body" style={styles.centered}>
        {t('scanner.productNotFoundSubtitle')}
      </AppText>
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
