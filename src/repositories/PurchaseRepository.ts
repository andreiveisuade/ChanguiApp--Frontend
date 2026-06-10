import { apiFetch } from '@/utils/apiFetch';
import {
  PaymentStatus,
  Purchase,
  PurchaseDetail,
  PurchaseItem,
  PurchaseSummary,
} from '@/types/domain';

interface RawPurchase {
  id: string;
  total: number;
  payment_status: PaymentStatus;
  created_at: string;
  store_id?: string | null;
  store_name?: string | null;
}

interface RawPurchaseItem {
  id: string;
  purchase_id: string;
  product_name: string;
  barcode: string;
  quantity: number;
  unit_price: number;
}

interface RawPurchaseDetail extends RawPurchase {
  items?: RawPurchaseItem[];
  summary?: PurchaseSummary;
}

/** Maps a raw backend purchase to the typed domain object. */
function mapPurchase(raw: RawPurchase): Purchase {
  return {
    id: raw.id,
    // El listado (GET /api/purchases) no siempre incluye store_name.
    store_name: raw.store_name ?? null,
    date: raw.created_at,
    total: raw.total,
    status: raw.payment_status,
  };
}

function mapItem(raw: RawPurchaseItem): PurchaseItem {
  return {
    id: raw.id,
    purchase_id: raw.purchase_id,
    product_name: raw.product_name,
    barcode: raw.barcode,
    quantity: raw.quantity,
    unit_price: raw.unit_price,
  };
}

export const PurchaseRepository = {
  /**
   * Historial de compras del usuario autenticado.
   * GET /api/purchases — ordenado por fecha descendente desde el backend.
   * Auth (bearer) y manejo de 401 lo cubre apiFetch.
   */
  async getPurchases(status?: PaymentStatus): Promise<Purchase[]> {
    const path = status ? `/api/purchases?status=${status}` : '/api/purchases';
    const response = await apiFetch(path);
    const data: RawPurchase[] = await response.json();
    return (data ?? []).map(mapPurchase);
  },

  /**
   * Detalle de una compra con sus items y el desglose impositivo.
   * GET /api/purchases/{id}
   */
  async getPurchaseById(id: string): Promise<PurchaseDetail> {
    const response = await apiFetch(`/api/purchases/${id}`);
    const data: RawPurchaseDetail = await response.json();
    const items = (data.items ?? []).map(mapItem);

    return {
      ...mapPurchase(data),
      item_count: items.length,
      items,
      summary: data.summary,
    };
  },
};

export default PurchaseRepository;
