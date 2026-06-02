import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { useScanner } from '@/viewmodels/useScanner';
import AppHeader from '@/components/layout/AppHeader';
import LoadingOverlay from '@/components/feedback/LoadingOverlay';
import ErrorMessage from '@/components/feedback/ErrorMessage';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { BarcodeFrame } from '@/components/scanner/BarcodeFrame';
import { AppText } from '@/components/atoms/AppText';
import { colors, spacing } from '@/constants/theme';

const CAMERA_BACKGROUND = '#101827';

export default function ScannerScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const {
    scanned,
    loading,
    errorMessage,
    handleBarcodeScanned,
    resetScanner,
    clearError,
  } = useScanner();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <AppText variant="H1" style={styles.centered}>
          {t('scanner.permission.title')}
        </AppText>
        <AppText variant="Body" style={[styles.centered, styles.permissionMessage]}>
          {t('scanner.permission.message')}
        </AppText>
        <PrimaryButton
          title={t('scanner.permission.allow')}
          accessibilityHint={t('scanner.permission.allowHint')}
          onPress={requestPermission}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <SafeAreaView style={styles.safeArea}>
        <AppHeader />

        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a'] }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
          <BarcodeFrame />
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <ErrorMessage
              message={errorMessage}
              closeAccessibilityHint={t('scanner.dismissError')}
              onClose={clearError}
            />
          </View>
        ) : null}

        {scanned ? (
          <View style={styles.actions}>
            <PrimaryButton
              title={t('scanner.scanAgain')}
              accessibilityHint={t('scanner.scanAgainHint')}
              onPress={resetScanner}
              disabled={loading}
            />
          </View>
        ) : null}

        <LoadingOverlay visible={loading} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.white,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  permissionContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  centered: {
    textAlign: 'center',
  },
  permissionMessage: {
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
    marginTop: spacing.md,
  },
  cameraContainer: {
    backgroundColor: CAMERA_BACKGROUND,
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  errorBanner: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  actions: {
    padding: spacing.xl,
  },
});
