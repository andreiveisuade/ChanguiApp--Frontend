import { useState, useEffect, useRef } from 'react';
import * as ProductCatalogRepository from '@/repositories/ProductCatalogRepository';
import { Product } from '@/types/domain';

export type UseProductSearchOptions = {
  minChars?: number;
  debounceMs?: number;
  limit?: number;
};

export type UseProductSearchReturn = {
  query: string;
  setQuery: (query: string) => void;
  results: Product[];
  isLoading: boolean;
};

const DEFAULT_MIN_CHARS = 2;
const DEFAULT_DEBOUNCE_MS = 250;
const DEFAULT_LIMIT = 20;

/**
 * Buscador de productos contra el catálogo local (SQLite/FTS5). No pega a la red.
 * Aplica debounce para no buscar en cada tecla y descarta resultados de
 * búsquedas obsoletas (la última query escrita gana, sin importar el orden en
 * que terminen las consultas async).
 */
export function useProductSearch(options?: UseProductSearchOptions): UseProductSearchReturn {
  const minChars = options?.minChars ?? DEFAULT_MIN_CHARS;
  const debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  const limit = options?.limit ?? DEFAULT_LIMIT;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cada búsqueda toma un id; solo la más reciente puede escribir el estado.
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < minChars) {
      requestId.current += 1;
      setResults([]);
      setIsLoading(false);
      return;
    }

    const currentId = ++requestId.current;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const found = await ProductCatalogRepository.searchProducts(trimmed, limit);
        if (currentId === requestId.current) setResults(found);
      } catch {
        if (currentId === requestId.current) setResults([]);
      } finally {
        if (currentId === requestId.current) setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, minChars, debounceMs, limit]);

  return { query, setQuery, results, isLoading };
}

export default useProductSearch;
