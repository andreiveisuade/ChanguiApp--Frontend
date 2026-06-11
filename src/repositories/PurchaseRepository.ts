import httpClient from '@/config/clients';
import {
  PaymentStatus,
  Purchase,
  PurchaseDetail,
  PurchaseItem,
  TaxSummary,
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
  summary?: TaxSummary;
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
   * Auth (bearer) y manejo de 401 lo cubre el httpClient.
   */
  async getPurchases(status?: PaymentStatus): Promise<Purchase[]> {
    const { data } = await httpClient.get<RawPurchase[]>('/api/purchases', {
      params: status ? { status } : undefined,
    });
    return (data ?? []).map(mapPurchase);
  },

  /**
   * Detalle de una compra con sus items y el desglose impositivo.
   * GET /api/purchases/{id} — un 404 acá significa que la compra no es del
   * usuario o no existe, así que debe seguir siendo error (lo tira el
   * interceptor del httpClient). Por eso no usamos validateStatus.
   */
  async getPurchaseById(id: string): Promise<PurchaseDetail> {
    const { data } = await httpClient.get<RawPurchaseDetail>(`/api/purchases/${id}`);
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
