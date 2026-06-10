import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Product } from '@/types/domain';
import CartRepository from '@/repositories/CartRepository';

export type UseProductFoundReturn = {
  product: Product | null;
  barcode: string;
  quantity: number;
  subtotal: number;
  netSubtotal: number;
  ivaSubtotal: number;
  taxRate: number;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
  goToScanner: () => void;
  goToCart: () => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  clearError: () => void;
};

const parseProduct = (raw: string | undefined): Product | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Product | null;
  } catch {
    return null;
  }
};

export const useProductFound = (): UseProductFoundReturn => {
  const router = useRouter();
  const params = useLocalSearchParams<{ product: string; barcode: string }>();

  const product = useMemo<Product | null>(() => parseProduct(params.product), [params.product]);
  const barcode = params.barcode ?? '';

  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = product ? product.price * quantity : 0;
  // El backend ya devuelve el desglose unitario; acá sólo se multiplica por
  // la cantidad (no se recalcula la alícuota en el cliente).
  const netSubtotal = product?.tax ? product.tax.net_price * quantity : subtotal;
  const ivaSubtotal = product?.tax ? product.tax.tax_amount * quantity : 0;
  const taxRate = product?.tax?.rate ?? 0;

  const incrementQuantity = (): void => setQuantity((q) => q + 1);

  const decrementQuantity = (): void => {
    setQuantity((q) => (q > 1 ? q - 1 : q));
  };

  const goToScanner = (): void => router.replace('/(tabs)/scanner');

  const goToCart = async (): Promise<void> => {
    if (!product) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await CartRepository.addItem(product.id, quantity, product.price);
      router.replace('/(tabs)/cart');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al agregar al carrito');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (): void => {
    setErrorMessage(null);
  };

  return {
    product,
    barcode,
    quantity,
    subtotal,
    netSubtotal,
    ivaSubtotal,
    taxRate,
    incrementQuantity,
    decrementQuantity,
    goToScanner,
    goToCart,
    isLoading,
    errorMessage,
    clearError,
  };
};

export default useProductFound;
