import { apiFetch } from '@/utils/apiFetch';

export interface CheckoutPreference {
  preference_id: string;
  init_point: string;
}

export interface PurchaseStatus {
  id: string;
  payment_status: string;
}

export const CheckoutRepository = {
  /**
   * Crea la preferencia de pago de Mercado Pago para el carrito activo.
   * POST /api/checkout — devuelve el init_point (URL hosted de Checkout Pro).
   * Auth (bearer) y 401 los cubre apiFetch.
   */
  async createPreference(): Promise<CheckoutPreference> {
    const response = await apiFetch('/api/checkout', { method: 'POST' });
    return response.json();
  },

  /**
   * Lista las compras del usuario (id + estado), ordenadas por fecha desc.
   * GET /api/purchases — se usa para detectar la compra creada por el webhook
   * tras volver del checkout.
   */
  async listPurchaseStatuses(): Promise<PurchaseStatus[]> {
    const response = await apiFetch('/api/purchases');
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map((p) => ({ id: p.id, payment_status: p.payment_status }));
  },
};

export default CheckoutRepository;
