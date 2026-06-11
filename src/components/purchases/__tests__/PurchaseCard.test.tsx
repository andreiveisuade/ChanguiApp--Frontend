import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PurchaseCard } from '../PurchaseCard';
import { Purchase } from '@/types/domain';

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text> };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const makePurchase = (overrides: Partial<Purchase> = {}): Purchase => ({
  id: '1',
  store_name: 'Coto',
  date: '2026-06-01',
  total: 12500,
  status: 'completed',
  ...overrides,
});

describe('PurchaseCard Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders store name, date and formatted total', () => {
    const { getByText } = render(
      <PurchaseCard purchase={makePurchase()} onPress={mockOnPress} />
    );

    expect(getByText('Coto')).toBeTruthy();
    expect(getByText('01/06/2026')).toBeTruthy();
    expect(getByText('$12.500')).toBeTruthy();
  });

  it('exposes an accessibility label with store name and formatted total', () => {
    const { getByLabelText } = render(
      <PurchaseCard purchase={makePurchase()} onPress={mockOnPress} />
    );

    expect(getByLabelText('Coto — $12.500')).toBeTruthy();
  });

  it('calls onPress when the card is pressed', () => {
    const { getByLabelText } = render(
      <PurchaseCard purchase={makePurchase()} onPress={mockOnPress} />
    );

    fireEvent.press(getByLabelText('Coto — $12.500'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
