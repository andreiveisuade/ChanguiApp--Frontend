import { apiFetch } from '@/utils/apiFetch';

export interface CheckoutPreference {
  preference_id: string;
  init_point: string;
}

export type CheckoutPaymentStatus = 'pending' | 'completed' | 'failed' | 'not_found';

export interface CheckoutStatus {
  status: CheckoutPaymentStatus;
}

export const CheckoutRepository = {
  /**
   * Crea la preferencia de pago de Mercado Pago para el carrito activo.
   * POST /api/checkout — devuelve el init_point (URL hosted de Checkout Pro) y
   * el preference_id que identifica este checkout. returnUrl es el deep link al
   * que MP debe reenviar la app tras el pago.
   * Auth (bearer) y 401 los cubre apiFetch.
   */
  async createPreference(returnUrl: string): Promise<CheckoutPreference> {
    const response = await apiFetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ returnUrl }),
    });
    return response.json();
  },

  /**
   * Estado determinista de la compra asociada a una preferencia.
   * GET /api/checkout/status?preference_id= — la compra la crea el webhook de
   * forma asíncrona, así que se consulta hasta que pase a 'completed'.
   */
  async getStatus(preferenceId: string): Promise<CheckoutStatus> {
    const response = await apiFetch(
      `/api/checkout/status?preference_id=${encodeURIComponent(preferenceId)}`
    );
    return response.json();
  },
};

export default CheckoutRepository;
