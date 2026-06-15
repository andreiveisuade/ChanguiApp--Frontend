import { useState, useRef } from 'react';
import { Vibration } from 'react-native';
import { useRouter } from 'expo-router';
import { getProductByBarcode } from '@/repositories/ScannerRepository';

export type UseScannerReturn = {
  scanned: boolean;
  loading: boolean;
  errorMessage: string | null;
  handleBarcodeScanned: (event: { data: string }) => Promise<void>;
  resetScanner: () => void;
  clearError: () => void;
};

export const useScanner = (): UseScannerReturn => {
  const router = useRouter();
  const [scanned, setScanned] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronous lock ref to prevent multiple triggers in rapid succession
  const isScanningRef = useRef<boolean>(false);

  const handleBarcodeScanned = async ({ data }: { data: string }): Promise<void> => {
    if (isScanningRef.current || scanned || loading) return;

    isScanningRef.current = true;
    setScanned(true);
    setLoading(true);
    setErrorMessage(null);
    Vibration.vibrate(200);

    try {
      const product = await getProductByBarcode(data);
      // El repository devuelve null para 404 (codigo no en catalogo).
      // Navegamos en ambos casos: ProductFoundScreen distingue null y muestra
      // el estado "producto no encontrado".
      router.push({
        pathname: '/product-found',
        params: { product: JSON.stringify(product), barcode: data },
      });
    } catch (err) {
      // Error real (red, timeout, 5xx): mostramos el mensaje en pantalla.
      // El usuario puede reintentar con el boton "Escanear nuevamente".
      const message = err instanceof Error ? err.message : 'Unknown error';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = (): void => {
    isScanningRef.current = false;
    setScanned(false);
    setLoading(false);
    setErrorMessage(null);
  };

  const clearError = (): void => {
    setErrorMessage(null);
  };

  return {
    scanned,
    loading,
    errorMessage,
    handleBarcodeScanned,
    resetScanner,
    clearError,
  };
};

export default useScanner;
