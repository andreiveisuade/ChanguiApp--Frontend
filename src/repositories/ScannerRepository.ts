import { API_URL, API_TIMEOUT_MS } from '@/constants/api';
import { Product } from '@/types/domain';
import AuthRepository from '@/repositories/AuthRepository';

export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const session = await AuthRepository.getStoredSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (session?.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
    }

    const response = await fetch(`${API_URL}/api/products/barcode/${barcode}`, {
      headers,
      signal: controller.signal,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      let message = `Product lookup failed: status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && typeof errorData.message === 'string') {
          message = errorData.message;
        } else if (errorData && typeof errorData.error === 'string') {
          message = errorData.error;
        }
      } catch {
        // Ignorar si el cuerpo no es JSON
      }
      throw new Error(message);
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
