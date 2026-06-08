import { API_URL, API_TIMEOUT_MS } from '@/constants/api';
import { Product } from '@/types/domain';
import AuthRepository from '@/repositories/AuthRepository';
import * as ProductCatalogRepository from '@/repositories/ProductCatalogRepository';

const buildHeaders = (token: string | undefined): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/** Lee el mensaje de error del body (message/error). Fallback si no es JSON o no trae ninguno. */
const extractErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const errorData = await response.json();
    if (errorData && typeof errorData.message === 'string') {
      return errorData.message;
    }
    if (errorData && typeof errorData.error === 'string') {
      return errorData.error;
    }
  } catch {
    // Ignorar si el cuerpo no es JSON
  }
  return fallback;
};

/**
 * Resuelve un producto por barcode. Cache-first: primero busca en el catálogo
 * local (SQLite), instantáneo y sin red. Si no está (catálogo no sincronizado
 * aún o producto nuevo), o si el cache falla, cae al backend.
 */
export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    const local = await ProductCatalogRepository.getProductByBarcode(barcode);
    if (local) {
      return local;
    }
  } catch {
    // Si el cache local falla, seguir con la red — el escaneo no debe romperse.
  }
  return fetchProductFromNetwork(barcode);
}

async function fetchProductFromNetwork(barcode: string): Promise<Product | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const session = await AuthRepository.getStoredSession();
    const response = await fetch(`${API_URL}/api/products/barcode/${barcode}`, {
      headers: buildHeaders(session?.token),
      signal: controller.signal,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const message = await extractErrorMessage(
        response,
        `Product lookup failed: status ${response.status}`,
      );
      throw new Error(message);
    }

    return (await response.json()) as Product;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('network timeout', { cause: err });
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
