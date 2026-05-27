/**
 * Unit tests for CartRepository.getCart
 *
 * HTTP fetch is mocked globally so tests run without network access.
 * AuthRepository.getStoredSession is mocked to return a valid session token.
 */

// Mock AuthRepository before importing CartRepository
jest.mock('@/repositories/AuthRepository', () => ({
  __esModule: true,
  default: {
    getStoredSession: jest.fn(),
  },
}));

import AuthRepository from '@/repositories/AuthRepository';
import { CartRepository } from '@/repositories/CartRepository';

const mockGetStoredSession = AuthRepository.getStoredSession as jest.Mock;

const VALID_SESSION = { token: 'test-token', user: { id: 'u1' } };

const RAW_PRODUCT = {
  id: 'p1',
  name: 'Leche La Serenísima',
  barcode: '7790001234567',
  brand: 'La Serenísima',
  image_url: 'https://example.com/leche.jpg',
  price: 850,
};

const RAW_ITEM_WITH_PRODUCT = {
  id: 'i1',
  cart_id: 'c1',
  product_id: 'p1',
  quantity: 2,
  unit_price: 850,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  product: RAW_PRODUCT,
};

const RAW_ITEM_WITH_PRODUCTS_ALIAS = {
  ...RAW_ITEM_WITH_PRODUCT,
  product: undefined,
  products: RAW_PRODUCT,
};

const RAW_CART = {
  id: 'c1',
  user_id: 'u1',
  store_id: 's1',
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  cart_items: [RAW_ITEM_WITH_PRODUCT],
};

function mockFetchOk(body: object) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => body,
  }) as jest.Mock;
}

function mockFetchError(status: number, body: object) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => body,
  }) as jest.Mock;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetStoredSession.mockResolvedValue(VALID_SESSION);
});

describe('CartRepository.getCart', () => {
  it('maps a cart with items correctly using item.product', async () => {
    mockFetchOk({
      cart: RAW_CART,
      items: [RAW_ITEM_WITH_PRODUCT],
      total: 1700,
    });

    const result = await CartRepository.getCart();

    expect(result.total).toBe(1700);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].product).toEqual({
      id: 'p1',
      name: 'Leche La Serenísima',
      barcode: '7790001234567',
      brand: 'La Serenísima',
      image_url: 'https://example.com/leche.jpg',
      price: 850,
    });
    expect(result.cart?.store_id).toBe('s1');
  });

  it('resolves item.products alias when item.product is absent', async () => {
    mockFetchOk({
      cart: { ...RAW_CART, cart_items: [RAW_ITEM_WITH_PRODUCTS_ALIAS] },
      items: [RAW_ITEM_WITH_PRODUCTS_ALIAS],
      total: 1700,
    });

    const result = await CartRepository.getCart();

    expect(result.items[0].product?.name).toBe('Leche La Serenísima');
  });

  it('returns null cart and empty items when cart is absent', async () => {
    mockFetchOk({ cart: null, items: [], total: 0 });

    const result = await CartRepository.getCart();

    expect(result.cart).toBeNull();
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('throws with the expected message when there is no active session', async () => {
    mockGetStoredSession.mockResolvedValue(null);

    await expect(CartRepository.getCart()).rejects.toThrow(
      'No active session found. Please log in again.'
    );
  });

  it('throws with the backend error message on non-ok HTTP response', async () => {
    mockFetchError(422, { message: 'Cart not found' });

    await expect(CartRepository.getCart()).rejects.toThrow('Cart not found');
  });
});
