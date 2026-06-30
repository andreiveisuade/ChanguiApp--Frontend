import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductFoundScreen from '../ProductFoundScreen';
import useProductFound from '@/viewmodels/useProductFound';
import { Product } from '@/types/domain';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o?.value !== undefined ? `${k} ${o.value}` : k),
  }),
}));

jest.mock('@/../assets/logos/changuiapp-logo.svg', () => 'ChanguiAppLogo');

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children }: any) => <Text>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text> };
});

jest.mock('@/viewmodels/useProductFound', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedUseProductFound = jest.mocked(useProductFound);

const incrementQuantity = jest.fn();
const decrementQuantity = jest.fn();
const goToScanner = jest.fn();
const goToCart = jest.fn();
const clearError = jest.fn();

const product: Product = {
  id: 'p1',
  name: 'Yerba Playadito',
  barcode: '7790001',
  brand: 'Playadito',
  image_url: null,
  price: 1000,
  tax: { category: 'IVA', rate: 21, net_price: 826.45, tax_amount: 173.55 },
} as Product;

const buildState = (overrides: Partial<ReturnType<typeof useProductFound>> = {}) =>
  ({
    product,
    barcode: '7790001',
    quantity: 1,
    subtotal: 1000,
    netSubtotal: 826.45,
    ivaSubtotal: 173.55,
    taxRate: 21,
    incrementQuantity,
    decrementQuantity,
    goToScanner,
    goToCart,
    isLoading: false,
    errorMessage: null,
    clearError,
    ...overrides,
  }) as unknown as ReturnType<typeof useProductFound>;

describe('ProductFoundScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseProductFound.mockReturnValue(buildState());
  });

  describe('producto no encontrado', () => {
    beforeEach(() => {
      mockedUseProductFound.mockReturnValue(buildState({ product: null }));
    });

    it('muestra el estado vacio y el boton de reintentar', () => {
      const { getByText, queryByText } = render(<ProductFoundScreen />);
      expect(getByText('scanner.productNotFound')).toBeTruthy();
      expect(queryByText('scanner.productFound')).toBeNull();
      expect(queryByText('scanner.addToCart')).toBeNull();
    });

    it('reintentar y back vuelven al scanner', () => {
      const { getByText, getAllByRole } = render(<ProductFoundScreen />);
      fireEvent.press(getByText('scanner.tryAgain'));
      expect(goToScanner).toHaveBeenCalled();

      // el back del header tambien navega al scanner
      const buttons = getAllByRole('button');
      fireEvent.press(buttons[0]);
      expect(goToScanner.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('producto encontrado', () => {
    it('muestra el mensaje de exito, el producto y los importes calculados', () => {
      const { getByText, getAllByText } = render(<ProductFoundScreen />);

      expect(getByText('scanner.productFound')).toBeTruthy();
      expect(getByText('Yerba Playadito')).toBeTruthy();
      // precio sin IVA, IVA y total formateados con formatARS
      expect(getByText('$826')).toBeTruthy();
      expect(getByText('$174')).toBeTruthy();
      // $1.000 aparece dos veces: precio del producto y total del desglose
      expect(getAllByText('$1.000').length).toBeGreaterThanOrEqual(2);
    });

    it('refleja la cantidad actual', () => {
      mockedUseProductFound.mockReturnValue(buildState({ quantity: 3 }));
      const { getByText } = render(<ProductFoundScreen />);
      expect(getByText('3')).toBeTruthy();
    });

    it('el boton + incrementa la cantidad', () => {
      const { getByText } = render(<ProductFoundScreen />);
      fireEvent.press(getByText('+'));
      expect(incrementQuantity).toHaveBeenCalledTimes(1);
    });

    it('el boton - decrementa cuando quantity > 1', () => {
      mockedUseProductFound.mockReturnValue(buildState({ quantity: 2 }));
      const { getByText } = render(<ProductFoundScreen />);
      fireEvent.press(getByText('-'));
      expect(decrementQuantity).toHaveBeenCalledTimes(1);
    });

    it('el boton - esta deshabilitado con quantity = 1', () => {
      const { getByText } = render(<ProductFoundScreen />);
      fireEvent.press(getByText('-'));
      expect(decrementQuantity).not.toHaveBeenCalled();
    });

    it('agregar al carrito invoca goToCart', () => {
      const { getByText } = render(<ProductFoundScreen />);
      fireEvent.press(getByText('scanner.addToCart'));
      expect(goToCart).toHaveBeenCalledTimes(1);
    });

    it('escanear otro invoca goToScanner', () => {
      const { getByText } = render(<ProductFoundScreen />);
      fireEvent.press(getByText('scanner.scanAnother'));
      expect(goToScanner).toHaveBeenCalledTimes(1);
    });

    it('con errorMessage muestra el banner de error', () => {
      mockedUseProductFound.mockReturnValue(
        buildState({ errorMessage: { title: 'Error', message: 'fallo agregar', code: 'GENERIC' } }),
      );
      const { getByText } = render(<ProductFoundScreen />);

      expect(getByText('fallo agregar')).toBeTruthy();
      // el ErrorMessage renderiza un boton de cierre con "X"
      expect(getByText('X')).toBeTruthy();
    });

    it('cerrar el error invoca clearError', () => {
      mockedUseProductFound.mockReturnValue(
        buildState({ errorMessage: { title: 'Error', message: 'fallo agregar', code: 'GENERIC' } }),
      );
      const { getByText } = render(<ProductFoundScreen />);
      // el boton de cerrar del ErrorMessage renderiza una "X"
      fireEvent.press(getByText('X'));
      expect(clearError).toHaveBeenCalledTimes(1);
    });

    it('isLoading deshabilita escanear otro y decrementar', () => {
      mockedUseProductFound.mockReturnValue(buildState({ quantity: 2, isLoading: true }));
      const { getByText } = render(<ProductFoundScreen />);

      fireEvent.press(getByText('scanner.scanAnother'));
      fireEvent.press(getByText('-'));
      fireEvent.press(getByText('+'));

      expect(goToScanner).not.toHaveBeenCalled();
      expect(decrementQuantity).not.toHaveBeenCalled();
      expect(incrementQuantity).not.toHaveBeenCalled();
    });
  });
});
