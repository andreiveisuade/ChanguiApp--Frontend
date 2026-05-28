import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/atoms/AppText';
import { colors, spacing, touchTarget } from '@/utils/theme';

interface CameraOverlayProps {
  lastBarcode: string | null;
  scanned: boolean;
  onScanAgain: () => void;
  onBackToCart: () => void;
}

export function CameraOverlay({
  lastBarcode,
  scanned,
  onScanAgain,
  onBackToCart,
}: CameraOverlayProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View style={styles.overlay}>
      <AppText variant="Display" style={styles.titleWhite}>
        {t('scanner.title')}
      </AppText>
      <AppText variant="Body" style={styles.textWhite}>
        {t('scanner.aim')}
      </AppText>

      <View style={styles.scanBox} />

      {lastBarcode && (
        <AppText variant="Body" style={styles.lastCode}>
          {t('scanner.lastCode', { code: lastBarcode })}
        </AppText>
      )}

      <Pressable
        style={styles.secondaryButton}
        onPress={onBackToCart}
        accessibilityRole="button"
        accessibilityLabel={t('scanner.backToCart')}
      >
        <AppText variant="H3" style={styles.secondaryButtonText}>
          {t('scanner.backToCart')}
        </AppText>
      </Pressable>

      {scanned && (
        <Pressable
          style={styles.button}
          onPress={onScanAgain}
          accessibilityRole="button"
          accessibilityLabel={t('scanner.scanAgain')}
        >
          <AppText variant="H3" style={styles.buttonText}>
            {t('scanner.scanAgain')}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  titleWhite: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  textWhite: {
    color: colors.white,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  scanBox: {
    width: 260,
    height: 180,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 20,
    backgroundColor: 'transparent',
    marginBottom: spacing.xl,
  },
  lastCode: {
    color: colors.white,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    minHeight: touchTarget.minHeight,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    minHeight: touchTarget.minHeight,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
  },
});

export default CameraOverlay;
