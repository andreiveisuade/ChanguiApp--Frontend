import { API_URL, API_TIMEOUT_MS } from '@/constants/api';
import { Product } from '@/types/domain';

export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/api/products/barcode/${barcode}`, {
      signal: controller.signal,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Product lookup failed');
    }

    return (await response.json()) as Product;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('network timeout');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
