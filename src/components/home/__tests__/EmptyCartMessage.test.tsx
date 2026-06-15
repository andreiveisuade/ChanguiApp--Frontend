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
  it('renders correct fallback title and subtitle translation keys when message is not provided', () => {
    const { getByText } = render(<EmptyCartMessage />);

    expect(getByText('home.emptyCart')).toBeTruthy();
    expect(getByText('home.emptyCartSubtitle')).toBeTruthy();
  });

  it('renders custom title when message is provided', () => {
    const { getByText, queryByText } = render(
      <EmptyCartMessage message="Tu changuito está vacío" />,
    );

    expect(getByText('Tu changuito está vacío')).toBeTruthy();
    expect(queryByText('home.emptyCart')).toBeNull();
    expect(getByText('home.emptyCartSubtitle')).toBeTruthy();
  });

  it('renders with the shopping cart icon', () => {
    const { getByTestId } = render(<EmptyCartMessage />);
    expect(getByTestId('app-icon').props.children).toBe('carrito');
  });
});
