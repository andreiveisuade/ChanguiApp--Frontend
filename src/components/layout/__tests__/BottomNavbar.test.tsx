import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomNavbar } from '../BottomNavbar';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return {
    AppIcon: ({ name, color }: any) => (
      <Text testID="app-icon" style={{ color }}>
        {name}
      </Text>
    ),
  };
});

const ROUTES = ['home', 'cart', 'scanner', 'history', 'settings'];

function buildProps(
  focusedIndex: number,
  navigate = jest.fn(),
  emit?: jest.Mock,
): BottomTabBarProps {
  const emitMock = emit ?? jest.fn(() => ({ defaultPrevented: false }));
  const routes = ROUTES.map((name) => ({ key: `${name}-key`, name }));
  const descriptors = routes.reduce(
    (acc, route) => {
      acc[route.key] = { options: {} };
      return acc;
    },
    {} as Record<string, any>,
  );

  return {
    state: { index: focusedIndex, routes },
    descriptors,
    navigation: { emit: emitMock, navigate },
  } as unknown as BottomTabBarProps;
}

describe('BottomNavbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a label for every route', () => {
    const { getByText } = render(<BottomNavbar {...buildProps(0)} />);

    expect(getByText('nav.home')).toBeTruthy();
    expect(getByText('nav.cart')).toBeTruthy();
    expect(getByText('nav.scanner')).toBeTruthy();
    expect(getByText('nav.history')).toBeTruthy();
    expect(getByText('nav.settings')).toBeTruthy();
  });

  it('navigates to a non-focused route on press', () => {
    const navigate = jest.fn();
    const { getByLabelText } = render(<BottomNavbar {...buildProps(0, navigate)} />);

    fireEvent.press(getByLabelText('nav.cart'));
    expect(navigate).toHaveBeenCalledWith('cart');
  });

  it('does not navigate when pressing the already focused route', () => {
    const navigate = jest.fn();
    const { getByLabelText } = render(<BottomNavbar {...buildProps(0, navigate)} />);

    fireEvent.press(getByLabelText('nav.home'));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not navigate when the tabPress event is prevented', () => {
    const navigate = jest.fn();
    const emit = jest.fn(() => ({ defaultPrevented: true }));
    const { getByLabelText } = render(<BottomNavbar {...buildProps(0, navigate, emit)} />);

    fireEvent.press(getByLabelText('nav.cart'));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('renders the highlighted scanner button', () => {
    const navigate = jest.fn();
    const { getByLabelText } = render(<BottomNavbar {...buildProps(0, navigate)} />);

    const scanner = getByLabelText('nav.scanner');
    expect(scanner).toBeTruthy();
    fireEvent.press(scanner);
    expect(navigate).toHaveBeenCalledWith('scanner');
  });

  it('falls back to the raw route name when no label/icon mapping exists', () => {
    const navigate = jest.fn();
    const routes = [{ key: 'profile-key', name: 'profile' }];
    const props = {
      state: { index: 1, routes },
      descriptors: { 'profile-key': { options: {} } },
      navigation: { emit: jest.fn(() => ({ defaultPrevented: false })), navigate },
    } as unknown as BottomTabBarProps;

    const { getByText } = render(<BottomNavbar {...props} />);
    expect(getByText('profile')).toBeTruthy();
  });
});
