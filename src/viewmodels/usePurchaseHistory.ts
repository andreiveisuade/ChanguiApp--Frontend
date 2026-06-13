import { useState, useEffect, useCallback, useMemo } from 'react';
import PurchaseRepository from '@/repositories/PurchaseRepository';
import { Purchase } from '@/types/domain';
import { UserFriendlyError } from '@/types/errors';
import { useAsyncAction } from '@/hooks/useAsyncAction';

export const DATE_FILTERS = ['thisWeek', 'thisMonth', 'thisYear'] as const;
export type DateFilter = (typeof DATE_FILTERS)[number];

export type PurchaseSummary = {
  totalSpent: number;
  completedCount: number;
};

export type UsePurchaseHistoryReturn = {
  purchases: Purchase[];
  filtered: Purchase[];
  summary: PurchaseSummary;
  search: string;
  setSearch: (value: string) => void;
  filter: DateFilter;
  setFilter: (value: DateFilter) => void;
  isLoading: boolean;
  error: UserFriendlyError | null;
  refresh: () => Promise<void>;
};

/** Filtra por ventana temporal usando la fecha de la compra. */
function withinFilter(dateIso: string, filter: DateFilter): boolean {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  if (filter === 'thisWeek') {
    // Semana calendario (desde el lunes), coherente con thisMonth/thisYear.
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    const daysFromMonday = (now.getDay() + 6) % 7; // 0 = lunes ... 6 = domingo
    startOfWeek.setDate(now.getDate() - daysFromMonday);
    return date >= startOfWeek;
  }
  if (filter === 'thisMonth') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  return date.getFullYear() === now.getFullYear();
}

export const usePurchaseHistory = (): UsePurchaseHistoryReturn => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<DateFilter>('thisYear');
  const { isLoading, error, run } = useAsyncAction(true);

  const fetchPurchases = useCallback(async () => {
    const data = await run(() => PurchaseRepository.getPurchases());
    if (data) {
      setPurchases(data);
    }
  }, [run]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const refresh = useCallback(async () => {
    await fetchPurchases();
  }, [fetchPurchases]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return purchases.filter((p) => {
      if (!withinFilter(p.date, filter)) return false;
      if (!q) return true;
      const store = (p.store_name ?? '').toLowerCase();
      return store.includes(q) || String(p.id).toLowerCase().includes(q);
    });
  }, [purchases, search, filter]);

  const summary = useMemo<PurchaseSummary>(() => {
    const completed = filtered.filter((p) => p.status === 'completed');
    const totalSpent = completed.reduce((acc, p) => acc + p.total, 0);
    const completedCount = completed.length;
    return { totalSpent, completedCount };
  }, [filtered]);

  return {
    purchases,
    filtered,
    summary,
    search,
    setSearch,
    filter,
    setFilter,
    isLoading,
    error,
    refresh,
  };
};

export default usePurchaseHistory;
