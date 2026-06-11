import httpClient from '@/config/clients';

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
   * el preference_id que identifica este checkout.
   * Auth (bearer) y 401 los cubre el httpClient.
   */
  async createPreference(): Promise<CheckoutPreference> {
    const { data } = await httpClient.post<CheckoutPreference>('/api/checkout');
    return data;
  },

  /**
   * Estado determinista de la compra asociada a una preferencia.
   * GET /api/checkout/status?preference_id= — la compra la crea el webhook de
   * forma asíncrona, así que se consulta hasta que pase a 'completed'.
   */
  async getStatus(preferenceId: string): Promise<CheckoutStatus> {
    const { data } = await httpClient.get<CheckoutStatus>('/api/checkout/status', {
      params: { preference_id: preferenceId },
    });
    return data;
  },
};

export default CheckoutRepository;
