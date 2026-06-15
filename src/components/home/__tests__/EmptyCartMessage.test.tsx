import React from 'react';
import { render } from '@testing-library/react-native';
import { EmptyCartMessage } from '../EmptyCartMessage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text> };
});

describe('EmptyCartMessage Component', () => {
  it('muestra solo el subtitle (sin titulo de carrito vacio)', () => {
    const { getByText, queryByText } = render(<EmptyCartMessage />);

    expect(getByText('home.emptyCartSubtitle')).toBeTruthy();
    expect(queryByText('home.emptyCart')).toBeNull();
  });

  it('renders with the shopping cart icon', () => {
    const { getByTestId } = render(<EmptyCartMessage />);
    expect(getByTestId('app-icon').props.children).toBe('carrito');
  });
});
