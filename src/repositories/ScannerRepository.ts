import httpClient from '@/config/clients';
import { Product } from '@/types/domain';
import * as ProductCatalogRepository from '@/repositories/ProductCatalogRepository';

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
  // 404 = el código no está en el catálogo: queremos null, no un error.
  // validateStatus deja pasar el 404 sin que el interceptor lo trate como error.
  const response = await httpClient.get<Product>(`/api/products/barcode/${barcode}`, {
    validateStatus: (status) => status === 200 || status === 404,
  });

  if (response.status === 404) {
    return null;
  }
  return response.data;
}
