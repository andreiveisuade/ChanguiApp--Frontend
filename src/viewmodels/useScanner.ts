import { useState } from 'react';
import { Vibration } from 'react-native';
import { useRouter } from 'expo-router';
import { getProductByBarcode } from '@/repositories/ScannerRepository';

export type UseScannerReturn = {
  scanned: boolean;
  loading: boolean;
  handleBarcodeScanned: (event: { data: string }) => Promise<void>;
  resetScanner: () => void;
};

export const useScanner = (): UseScannerReturn => {
  const router = useRouter();
  const [scanned, setScanned] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleBarcodeScanned = async ({ data }: { data: string }): Promise<void> => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);
    Vibration.vibrate(200);

    try {
      const product = await getProductByBarcode(data);
      router.push({
        pathname: '/product-found',
        params: { product: JSON.stringify(product), barcode: data },
      });
    } catch {
      router.push({
        pathname: '/product-found',
        params: { product: JSON.stringify(null), barcode: data },
      });
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = (): void => {
    setScanned(false);
    setLoading(false);
  };

  return {
    scanned,
    loading,
    handleBarcodeScanned,
    resetScanner,
  };
};

export default useScanner;
