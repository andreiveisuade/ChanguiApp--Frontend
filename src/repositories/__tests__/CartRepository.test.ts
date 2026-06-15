import CartRepository from '../CartRepository';
import { apiFetch } from '@/utils/apiFetch';

jest.mock('@/utils/apiFetch', () => ({ apiFetch: jest.fn() }));

const mockedFetch = jest.mocked(apiFetch);
const jsonResponse = (data: unknown) => ({ json: async () => data }) as Response;

describe('CartRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('mapea cart + items y normaliza la relación products → product', async () => {
      mockedFetch.mockResolvedValueOnce(
        jsonResponse({
          cart: {
            id: 'c1',
            user_id: 'u1',
            store_id: 's1',
            status: 'active',
            cart_items: [
              {
                id: 'i1',
                cart_id: 'c1',
                product_id: 'p1',
                quantity: 2,
                unit_price: 1000,
                products: {
                  id: 'p1',
                  name: 'Yerba',
                  barcode: '779',
                  brand: 'Playadito',
                  image_url: null,
                  price: 1000,
                },
              },
            ],
          },
          items: [
            {
              id: 'i1',
              cart_id: 'c1',
              product_id: 'p1',
              quantity: 2,
              unit_price: 1000,
              product: {
                id: 'p1',
                name: 'Yerba',
                barcode: '779',
                brand: 'Playadito',
                image_url: null,
                price: 1000,
              },
            },
          ],
          total: 2000,
          summary: { subtotal_net: 1652.9, taxes: [], total: 2000 },
        }),
      );

      const result = await CartRepository.getCart();

      expect(mockedFetch).toHaveBeenCalledWith('/api/cart');
      expect(result.cart?.id).toBe('c1');
      expect(result.cart?.cart_items[0].product?.name).toBe('Yerba');
      expect(result.items[0].product?.id).toBe('p1');
      expect(result.total).toBe(2000);
      expect(result.summary.subtotal_net).toBe(1652.9);
    });

    it('devuelve cart null, total 0 y summary vacío cuando faltan campos', async () => {
      mockedFetch.mockResolvedValueOnce(jsonResponse({ cart: null, items: [], total: 'x' }));

      const result = await CartRepository.getCart();

      expect(result.cart).toBeNull();
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.summary).toEqual({ subtotal_net: 0, taxes: [], total: 0 });
    });

    it('mapea item sin producto a product null', async () => {
      mockedFetch.mockResolvedValueOnce(
        jsonResponse({
          cart: null,
          items: [{ id: 'i1', cart_id: 'c1', product_id: 'p1', quantity: 1, unit_price: 500 }],
          total: 500,
          summary: { subtotal_net: 413, taxes: [], total: 500 },
        }),
      );

      const result = await CartRepository.getCart();

      expect(result.items[0].product).toBeNull();
    });
  });

  describe('mutaciones', () => {
    it('updateItemQuantity hace PUT con la cantidad', async () => {
      mockedFetch.mockResolvedValueOnce(jsonResponse({}));

      await CartRepository.updateItemQuantity('i1', 5);

      expect(mockedFetch).toHaveBeenCalledWith('/api/cart/items/i1', {
        method: 'PUT',
        body: JSON.stringify({ quantity: 5 }),
      });
    });

    it('deleteItem hace DELETE', async () => {
      mockedFetch.mockResolvedValueOnce(jsonResponse({}));

      await CartRepository.deleteItem('i1');

      expect(mockedFetch).toHaveBeenCalledWith('/api/cart/items/i1', { method: 'DELETE' });
    });
  });

  describe('addItem', () => {
    it('con carrito existente: POST sin store_id', async () => {
      mockedFetch
        .mockResolvedValueOnce(
          jsonResponse({
            cart: { id: 'c1', user_id: 'u1', store_id: 's1', status: 'active', cart_items: [] },
            items: [],
            total: 0,
          }),
        )
        .mockResolvedValueOnce(jsonResponse({}));

      await CartRepository.addItem('p1', 2, 1000);

      expect(mockedFetch).toHaveBeenLastCalledWith('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ product_id: 'p1', quantity: 2, unit_price: 1000 }),
      });
    });

    it('sin carrito y sin stores disponibles: POST sin store_id', async () => {
      mockedFetch
        .mockResolvedValueOnce(jsonResponse({ cart: null, items: [], total: 0 }))
        .mockResolvedValueOnce(jsonResponse([]))
        .mockResolvedValueOnce(jsonResponse({}));

      await CartRepository.addItem('p1', 1, 500);

      expect(mockedFetch).toHaveBeenNthCalledWith(2, '/api/stores');
      expect(mockedFetch).toHaveBeenLastCalledWith('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ product_id: 'p1', quantity: 1, unit_price: 500 }),
      });
    });

    it('sin carrito: trae stores y POST con el store_id del primero', async () => {
      mockedFetch
        .mockResolvedValueOnce(jsonResponse({ cart: null, items: [], total: 0 }))
        .mockResolvedValueOnce(jsonResponse([{ id: 'store-1' }, { id: 'store-2' }]))
        .mockResolvedValueOnce(jsonResponse({}));

      await CartRepository.addItem('p1', 1, 500);

      expect(mockedFetch).toHaveBeenNthCalledWith(2, '/api/stores');
      expect(mockedFetch).toHaveBeenLastCalledWith('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({
          product_id: 'p1',
          quantity: 1,
          unit_price: 500,
          store_id: 'store-1',
        }),
      });
    });
  });
});
