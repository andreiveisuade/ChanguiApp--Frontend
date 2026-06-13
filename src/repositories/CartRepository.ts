import { CartWithItems, CartItemWithProduct, TaxBreakdown, TaxLine, TaxSummary } from '@/types/domain';
import httpClient from '@/config/clients';

const EMPTY_SUMMARY: TaxSummary = { subtotal_net: 0, taxes: [], total: 0 };
const DEFAULT_TAX_RATE = 21;

const round2 = (n: number) => Math.round(n * 100) / 100;

interface RawProduct {
  id: string;
  name: string;
  barcode: string;
  brand: string | null;
  image_url: string | null;
  price: number;
  tax?: TaxBreakdown;
}

interface RawCartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
  updated_at?: string;
  product?: RawProduct | null;
  products?: RawProduct | null;
}

interface RawCart {
  id: string;
  user_id: string;
  store_id?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  cart_items?: RawCartItem[];
}

interface GetCartResponse {
  cart: RawCart | null;
  items?: RawCartItem[];
  total?: number;
  summary?: TaxSummary;
}

interface Store {
  id: string;
}

/** Maps a raw backend cart item to the typed domain object. */
function mapRawItem(item: RawCartItem): CartItemWithProduct {
  const rawProduct = item.product || item.products;
  return {
    id: item.id,
    cart_id: item.cart_id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    created_at: item.created_at,
    updated_at: item.updated_at,
    product: rawProduct
      ? {
          id: rawProduct.id,
          name: rawProduct.name,
          barcode: rawProduct.barcode,
          brand: rawProduct.brand,
          image_url: rawProduct.image_url,
          price: rawProduct.price,
          tax: rawProduct.tax,
        }
      : null,
  };
}

function calculateItemsTotal(items: CartItemWithProduct[]): number {
  return items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
}

function hasSummaryValues(summary: TaxSummary | undefined): summary is TaxSummary {
  if (!summary) return false;

  return (
    summary.subtotal_net > 0 ||
    summary.total > 0 ||
    summary.taxes.some((tax) => tax.base > 0 || tax.amount > 0)
  );
}

function buildSummaryFromItems(items: CartItemWithProduct[], total: number): TaxSummary {
  if (items.length === 0 || total <= 0) return EMPTY_SUMMARY;

  const groupedTaxes = new Map<number, TaxLine>();
  let subtotalNet = 0;

  items.forEach((item) => {
    const lineTotal = item.unit_price * item.quantity;
    const productTax = item.product?.tax;
    const rate = productTax?.rate ?? DEFAULT_TAX_RATE;
    const netAmount = productTax ? productTax.net_price * item.quantity : lineTotal / (1 + rate / 100);
    const taxAmount = productTax ? productTax.tax_amount * item.quantity : lineTotal - netAmount;
    const current = groupedTaxes.get(rate) ?? { rate, label: `IVA ${rate}%`, base: 0, amount: 0 };

    current.base += netAmount;
    current.amount += taxAmount;
    groupedTaxes.set(rate, current);
    subtotalNet += netAmount;
  });

  return {
    subtotal_net: round2(subtotalNet),
    taxes: Array.from(groupedTaxes.values()).map((tax) => ({
      ...tax,
      base: round2(tax.base),
      amount: round2(tax.amount),
    })),
    total: round2(total),
  };
}

export const CartRepository = {
  /**
   * Fetches the current active cart and its items.
   * Auth (bearer token) y manejo de 401 lo cubre el httpClient.
   */
  async getCart(): Promise<{
    cart: CartWithItems | null;
    items: CartItemWithProduct[];
    total: number;
    summary: TaxSummary;
  }> {
    const { data } = await httpClient.get<GetCartResponse>('/api/cart');

    const rawCart = data.cart;
    let mappedCart: CartWithItems | null = null;

    if (rawCart) {
      const rawCartItems: RawCartItem[] = rawCart.cart_items ?? [];
      const mappedCartItems = rawCartItems.map(mapRawItem);

      mappedCart = {
        id: rawCart.id,
        user_id: rawCart.user_id,
        store_id: rawCart.store_id ?? '',
        status: rawCart.status,
        created_at: rawCart.created_at,
        updated_at: rawCart.updated_at,
        cart_items: mappedCartItems,
      };
    }

    const rawItems: RawCartItem[] = data.items ?? [];
    const mappedItems = rawItems.map(mapRawItem);
    const itemsForTotals = mappedItems.length > 0 ? mappedItems : mappedCart?.cart_items ?? [];
    const calculatedTotal = calculateItemsTotal(itemsForTotals);
    const total = typeof data.total === 'number' && data.total > 0 ? data.total : calculatedTotal;
    const summary = hasSummaryValues(data.summary)
      ? data.summary
      : buildSummaryFromItems(itemsForTotals, total);

    return {
      cart: mappedCart,
      items: mappedItems,
      total,
      summary,
    };
  },

  /**
   * Modifies the quantity of an item in the cart.
   * PUT /api/cart/items/{id}
   */
  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    await httpClient.put(`/api/cart/items/${itemId}`, { quantity });
  },

  /**
   * Deletes an item from the cart.
   * DELETE /api/cart/items/{id}
   */
  async deleteItem(itemId: string): Promise<void> {
    await httpClient.delete(`/api/cart/items/${itemId}`);
  },

  /**
   * Adds an item to the active cart. If no active cart exists,
   * it retrieves the available stores and associates the new cart with the first store.
   */
  async addItem(productId: string, quantity: number, unitPrice: number): Promise<void> {
    const { cart } = await this.getCart();

    let storeId: string | undefined = undefined;
    if (!cart) {
      const { data: stores } = await httpClient.get<Store[]>('/api/stores');
      if (stores && stores.length > 0) {
        storeId = stores[0].id;
      }
    }

    const body: Record<string, unknown> = {
      product_id: productId,
      quantity,
      unit_price: unitPrice,
    };
    if (storeId) {
      body.store_id = storeId;
    }

    await httpClient.post('/api/cart/items', body);
  },
};

export default CartRepository;