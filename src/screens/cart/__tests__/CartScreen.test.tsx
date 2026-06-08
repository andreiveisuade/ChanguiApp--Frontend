import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CartScreen from '../CartScreen';
import useAuth from '@/viewmodels/useAuth';
import useCart, { UseCartReturn } from '@/viewmodels/useCart';
import useCheckout, { UseCheckoutReturn } from '@/viewmodels/useCheckout';
import { CartItemWithProduct, TaxSummary } from '@/types/domain';
import { UserFriendlyError } from '@/types/errors';
import { ROUTES } from '@/constants/routes';

jest.mock('@/i18n', () => ({ __esModule: true, default: { t: (key: string) => key } }));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o?.value !== undefined ? `${k} ${o.value}` : k),
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() },
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

jest.mock('@/viewmodels/useAuth', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/viewmodels/useCart', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/viewmodels/useCheckout', () => ({ __esModule: true, default: jest.fn() }));

// Mockeamos los componentes hijo para aislar la lógica de la screen del árbol
// interno (i18n, SafeArea, iconos) y exponer testIDs/acciones predecibles.
jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children }: any) => <Text>{children}</Text> };
});

jest.mock('@/components/cart/CartHeader', () => {
  const { Pressable, Text } = require('react-native');
  return {
    CartHeader: ({ userName, onProfilePress }: any) => (
      <Pressable testID="cart-header" onPress={onProfilePress}>
        <Text>{userName}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/components/cart/CartItem', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    CartItem: ({ name, onUpdateQuantity, onDelete }: any) => (
      <View testID={`cart-item-${name}`}>
        <Text>{name}</Text>
        <Pressable testID={`update-${name}`} onPress={() => onUpdateQuantity(5)} />
        <Pressable testID={`delete-${name}`} onPress={onDelete} />
      </View>
    ),
  };
});

jest.mock('@/components/cart/CartSummary', () => {
  const { Pressable, Text } = require('react-native');
  return {
    CartSummary: ({ onPay }: any) => (
      <Pressable testID="pay-button" onPress={onPay}>
        <Text>pay</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/components/home/EmptyCartMessage', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: () => <Text testID="empty-cart">empty</Text>,
  };
});

jest.mock('@/components/feedback/ErrorMessage', () => {
  const { Pressable } = require('react-native');
  return {
    __esModule: true,
    default: ({ onClose }: any) => <Pressable testID="error-message" onPress={onClose} />,
  };
});

jest.mock('@/components/feedback/LoadingOverlay', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ visible }: any) =>
      visible ? <Text testID="loading-overlay">loading</Text> : null,
  };
});

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseCart = jest.mocked(useCart);
const mockedUseCheckout = jest.mocked(useCheckout);

const item: CartItemWithProduct = {
  id: 'i1',
  cart_id: 'c1',
  product_id: 'p1',
  quantity: 2,
  unit_price: 1000,
  product: { id: 'p1', name: 'Yerba', barcode: '779', brand: 'Playadito', image_url: null, price: 1000 },
};

const summary: TaxSummary = { subtotal_net: 1652.9, taxes: [], total: 2000 };

const updateQuantity = jest.fn();
const removeItem = jest.fn();
const refresh = jest.fn();
const startCheckout = jest.fn();
const clearError = jest.fn();

const cartState = (overrides: Partial<UseCartReturn> = {}): UseCartReturn => ({
  cart: null,
  items: [item],
  total: 2000,
  summary,
  isLoading: false,
  error: null,
  refresh,
  updateQuantity,
  removeItem,
  ...overrides,
});

const checkoutState = (overrides: Partial<UseCheckoutReturn> = {}): UseCheckoutReturn => ({
  isStarting: false,
  error: null,
  clearError,
  startCheckout,
  ...overrides,
});

describe('CartScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({ user: { full_name: 'Andrei Veis' } } as any);
    mockedUseCart.mockReturnValue(cartState());
    mockedUseCheckout.mockReturnValue(checkoutState());
  });

  it('renderiza los items del carrito con el nombre del producto', () => {
    const { getByTestId, getByText } = render(<CartScreen />);

    expect(getByTestId('cart-item-Yerba')).toBeTruthy();
    expect(getByText('Yerba')).toBeTruthy();
    expect(getByTestId('pay-button')).toBeTruthy();
  });

  it('usa el nombre del usuario en el header', () => {
    const { getByText } = render(<CartScreen />);
    expect(getByText('Andrei Veis')).toBeTruthy();
  });

  it('cae al usuario por defecto cuando no hay full_name', () => {
    mockedUseAuth.mockReturnValue({ user: null } as any);
    const { getByText } = render(<CartScreen />);
    expect(getByText('home.defaultUser')).toBeTruthy();
  });

  it('muestra el mensaje de carrito vacío sin items y sin loading', () => {
    mockedUseCart.mockReturnValue(cartState({ items: [], isLoading: false }));
    const { getByTestId, queryByTestId } = render(<CartScreen />);

    expect(getByTestId('empty-cart')).toBeTruthy();
    expect(queryByTestId('pay-button')).toBeNull();
  });

  it('no muestra carrito vacío mientras carga aunque no haya items', () => {
    mockedUseCart.mockReturnValue(cartState({ items: [], isLoading: true }));
    const { queryByTestId } = render(<CartScreen />);

    expect(queryByTestId('empty-cart')).toBeNull();
  });

  it('muestra el error y al cerrarlo dispara refresh', () => {
    const error: UserFriendlyError = {
      title: 'Error',
      message: 'Falló la carga',
      code: 'UNKNOWN',
    };
    mockedUseCart.mockReturnValue(cartState({ error }));
    const { getByTestId, queryByTestId } = render(<CartScreen />);

    expect(getByTestId('error-message')).toBeTruthy();
    expect(queryByTestId('pay-button')).toBeNull();
    fireEvent.press(getByTestId('error-message'));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('updateQuantity se llama con el id del item y la cantidad', () => {
    const { getByTestId } = render(<CartScreen />);
    fireEvent.press(getByTestId('update-Yerba'));
    expect(updateQuantity).toHaveBeenCalledWith('i1', 5);
  });

  it('removeItem se llama con el id del item', () => {
    const { getByTestId } = render(<CartScreen />);
    fireEvent.press(getByTestId('delete-Yerba'));
    expect(removeItem).toHaveBeenCalledWith('i1');
  });

  it('al tocar pagar navega a la confirmación con el preferenceId', async () => {
    startCheckout.mockResolvedValueOnce({ preferenceId: 'pref-1' });
    const { getByTestId } = render(<CartScreen />);

    fireEvent.press(getByTestId('pay-button'));

    await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: ROUTES.checkout.confirmation,
      params: { preferenceId: 'pref-1' },
    });
  });

  it('si startCheckout devuelve null no navega', async () => {
    startCheckout.mockResolvedValueOnce(null);
    const { getByTestId } = render(<CartScreen />);

    fireEvent.press(getByTestId('pay-button'));

    await waitFor(() => expect(startCheckout).toHaveBeenCalledTimes(1));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('muestra el loading overlay mientras inicia el checkout', () => {
    mockedUseCheckout.mockReturnValue(checkoutState({ isStarting: true }));
    const { getByTestId } = render(<CartScreen />);
    expect(getByTestId('loading-overlay')).toBeTruthy();
  });

  it('el header navega a settings al tocar el perfil', () => {
    const { getByTestId } = render(<CartScreen />);
    fireEvent.press(getByTestId('cart-header'));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.tabs.settings);
  });

  it('muestra una alerta cuando hay checkoutError y limpia al confirmar', () => {
    const checkoutError: UserFriendlyError = {
      title: 'Error',
      message: 'Algo salió mal',
      code: 'SERVER_ERROR',
    };
    const alertSpy = jest.spyOn(Alert, 'alert');
    mockedUseCheckout.mockReturnValue(checkoutState({ error: checkoutError }));

    render(<CartScreen />);

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Algo salió mal', [
      { text: 'common.ok', onPress: clearError },
    ]);
    alertSpy.mockRestore();
  });
});
