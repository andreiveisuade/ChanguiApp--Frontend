import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PermissionRequest } from '@/components/scanner/PermissionRequest';
import { CameraOverlay } from '@/components/scanner/CameraOverlay';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'] as const;

export default function ScannerScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return <PermissionRequest onRequest={requestPermission} />;
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setBarcode(data);

    Alert.alert(t('scanner.scannedTitle'), t('scanner.scannedMessage', { code: data }), [
      { text: t('scanner.scanAgain'), onPress: () => setScanned(false) },
      { text: t('scanner.backToCart'), onPress: () => router.push('/(tabs)/cart') },
    ]);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <CameraOverlay
        lastBarcode={barcode}
        scanned={scanned}
        onScanAgain={() => setScanned(false)}
        onBackToCart={() => router.push('/(tabs)/cart')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
});
