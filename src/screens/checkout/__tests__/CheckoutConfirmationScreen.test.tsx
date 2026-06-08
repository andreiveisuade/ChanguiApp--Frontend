import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CheckoutConfirmationScreen from '../CheckoutConfirmationScreen';
import useCheckoutStatus, {
  CheckoutStatus,
  UseCheckoutStatusReturn,
} from '@/viewmodels/useCheckoutStatus';
import { ROUTES } from '@/constants/routes';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o?.value !== undefined ? `${k} ${o.value}` : k),
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() },
}));

const mockReplace = jest.fn();
const mockUseLocalSearchParams = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

jest.mock('@/viewmodels/useCheckoutStatus', () => ({ __esModule: true, default: jest.fn() }));

jest.mock('@/components/layout/ScreenWrapper', () => {
  const { View } = require('react-native');
  return { ScreenWrapper: ({ children }: any) => <View>{children}</View> };
});

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children }: any) => <Text>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return {
    AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text>,
  };
});

jest.mock('@/components/buttons/PrimaryButton', () => {
  const { Pressable, Text } = require('react-native');
  return {
    PrimaryButton: ({ title, onPress }: any) => (
      <Pressable testID={`primary-${title}`} onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/components/buttons/SecondaryButton', () => {
  const { Pressable, Text } = require('react-native');
  return {
    SecondaryButton: ({ title, onPress }: any) => (
      <Pressable testID={`secondary-${title}`} onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
  };
});

const mockedUseCheckoutStatus = jest.mocked(useCheckoutStatus);
const retry = jest.fn();

const setStatus = (status: CheckoutStatus): UseCheckoutStatusReturn => ({ status, retry });

describe('CheckoutConfirmationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ preferenceId: 'pref-1' });
    mockedUseCheckoutStatus.mockReturnValue(setStatus('checking'));
  });

  it('sin preferenceId redirige al home y no renderiza nada', async () => {
    mockUseLocalSearchParams.mockReturnValue({});
    const { toJSON } = render(<CheckoutConfirmationScreen />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(ROUTES.tabs.home));
    expect(toJSON()).toBeNull();
  });

  it('estado checking muestra el spinner y los textos de confirmando', () => {
    mockedUseCheckoutStatus.mockReturnValue(setStatus('checking'));
    const { getByText, UNSAFE_getByType } = render(<CheckoutConfirmationScreen />);

    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(getByText('checkout.confirmingTitle')).toBeTruthy();
    expect(getByText('checkout.confirmingSubtitle')).toBeTruthy();
  });

  it('estado success muestra el ícono de éxito y los botones de historial/home', () => {
    mockedUseCheckoutStatus.mockReturnValue(setStatus('success'));
    const { getByText, getByTestId } = render(<CheckoutConfirmationScreen />);

    expect(getByText('exito')).toBeTruthy();
    expect(getByText('checkout.successTitle')).toBeTruthy();
    expect(getByText('checkout.successSubtitle')).toBeTruthy();
    expect(getByTestId('primary-checkout.viewHistory')).toBeTruthy();
    expect(getByTestId('secondary-checkout.goHome')).toBeTruthy();
  });

  it('estado pending muestra el ícono de alerta', () => {
    mockedUseCheckoutStatus.mockReturnValue(setStatus('pending'));
    const { getByText } = render(<CheckoutConfirmationScreen />);

    expect(getByText('alerta')).toBeTruthy();
    expect(getByText('checkout.pendingTitle')).toBeTruthy();
  });

  it('estado timeout muestra el ícono de error y los botones de reintentar/volver al carrito', () => {
    mockedUseCheckoutStatus.mockReturnValue(setStatus('timeout'));
    const { getByText, getByTestId } = render(<CheckoutConfirmationScreen />);

    expect(getByText('error')).toBeTruthy();
    expect(getByText('checkout.timeoutTitle')).toBeTruthy();
    expect(getByTestId('primary-checkout.retry')).toBeTruthy();
    expect(getByTestId('secondary-checkout.backToCart')).toBeTruthy();
  });

  it('en timeout el botón primario llama retry', () => {
    mockedUseCheckoutStatus.mockReturnValue(setStatus('timeout'));
    const { getByTestId } = render(<CheckoutConfirmationScreen />);

    fireEvent.press(getByTestId('primary-checkout.retry'));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('en timeout el botón secundario navega al carrito', () => {
    mockedUseCheckoutStatus.mockReturnValue(setStatus('timeout'));
    const { getByTestId } = render(<CheckoutConfirmationScreen />);

    fireEvent.press(getByTestId('secondary-checkout.backToCart'));
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.tabs.cart);
  });

  it('en success el botón primario navega al historial', () => {
    mockedUseCheckoutStatus.mockReturnValue(setStatus('success'));
    const { getByTestId } = render(<CheckoutConfirmationScreen />);

    fireEvent.press(getByTestId('primary-checkout.viewHistory'));
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.tabs.history);
  });

  it('en success el botón secundario navega al home', () => {
    mockedUseCheckoutStatus.mockReturnValue(setStatus('success'));
    const { getByTestId } = render(<CheckoutConfirmationScreen />);

    fireEvent.press(getByTestId('secondary-checkout.goHome'));
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.tabs.home);
  });

  it('pasa el preferenceId al viewmodel', () => {
    render(<CheckoutConfirmationScreen />);
    expect(mockedUseCheckoutStatus).toHaveBeenCalledWith('pref-1');
  });
});
