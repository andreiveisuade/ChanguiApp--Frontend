import React from 'react';
import { FlatList } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from '../OnboardingScreen';
import { STORAGE_KEYS } from '@/constants/storage';
import { ROUTES } from '@/constants/routes';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o?.value !== undefined ? `${k} ${o.value}` : k),
  }),
}));

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { setItem: jest.fn(() => Promise.resolve()) },
}));

// Stub del slide: solo expone el título para verificar contenido.
jest.mock('@/components/onboarding/OnboardingSlide', () => {
  const { Text, View } = require('react-native');
  return {
    __esModule: true,
    default: ({ title }: any) => (
      <View testID="slide">
        <Text>{title}</Text>
      </View>
    ),
  };
});

// Stub del footer: expone onNext/onSkip y el flag isLast.
jest.mock('@/components/onboarding/OnboardingFooter', () => {
  const { Text, Pressable, View } = require('react-native');
  return {
    __esModule: true,
    default: ({ onNext, onSkip, isLast, current }: any) => (
      <View testID="footer">
        <Text testID="current-index">{String(current)}</Text>
        <Text testID="is-last">{String(isLast)}</Text>
        <Pressable testID="next" onPress={onNext} />
        <Pressable testID="skip" onPress={onSkip} />
      </View>
    ),
  };
});

const mockedSetItem = jest.mocked(AsyncStorage.setItem);

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSetItem.mockResolvedValue(undefined);
    // El FlatList real exige getItemLayout para scrollToIndex; lo neutralizamos.
    jest.spyOn(FlatList.prototype, 'scrollToIndex').mockImplementation(() => {});
  });

  it('arranca en el primer slide (index 0, no es el último)', () => {
    const { getByTestId } = render(<OnboardingScreen />);

    expect(getByTestId('current-index').props.children).toBe('0');
    expect(getByTestId('is-last').props.children).toBe('false');
  });

  it('next avanza el índice de slide', () => {
    const { getByTestId } = render(<OnboardingScreen />);

    fireEvent.press(getByTestId('next'));
    expect(getByTestId('current-index').props.children).toBe('1');

    fireEvent.press(getByTestId('next'));
    expect(getByTestId('current-index').props.children).toBe('2');
    expect(getByTestId('is-last').props.children).toBe('true');
  });

  it('next en el último slide completa el onboarding y navega a login', async () => {
    const { getByTestId } = render(<OnboardingScreen />);

    fireEvent.press(getByTestId('next'));
    fireEvent.press(getByTestId('next'));
    fireEvent.press(getByTestId('next'));

    await waitFor(() =>
      expect(mockedSetItem).toHaveBeenCalledWith(STORAGE_KEYS.onboardingCompleted, 'true'),
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(ROUTES.auth.login));
  });

  it('skip completa el onboarding y navega a login sin avanzar slides', async () => {
    const { getByTestId } = render(<OnboardingScreen />);

    fireEvent.press(getByTestId('skip'));

    await waitFor(() =>
      expect(mockedSetItem).toHaveBeenCalledWith(STORAGE_KEYS.onboardingCompleted, 'true'),
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(ROUTES.auth.login));
  });

  it('el botón "saltar" del header también completa el onboarding', async () => {
    const { getByText } = render(<OnboardingScreen />);

    fireEvent.press(getByText('onboarding.skip'));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(ROUTES.auth.login));
  });

  it('renderiza el título del primer slide', () => {
    const { getByText } = render(<OnboardingScreen />);

    expect(getByText('onboarding.slide1.title')).toBeTruthy();
  });
});
