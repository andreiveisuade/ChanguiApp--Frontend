import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '@/types/domain';
import CartRepository from '@/repositories/CartRepository';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';
import { UserFriendlyError } from '@/types/errors';

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
  errorMessage: UserFriendlyError | null;
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

  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<UserFriendlyError | null>(null);

  const addMutation = useMutation({
    mutationFn: ({ productId, qty, unitPrice }: { productId: string; qty: number; unitPrice: number }) =>
      CartRepository.addItem(productId, qty, unitPrice),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

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
    setErrorMessage(null);
    try {
      await addMutation.mutateAsync({
        productId: product.id,
        qty: quantity,
        unitPrice: product.price,
      });
      router.replace('/(tabs)/cart');
    } catch (err) {
      setErrorMessage(ErrorTranslationService.translate(err));
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
    isLoading: addMutation.isPending,
    errorMessage,
    clearError,
  };
};

export default useProductFound;
