import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CartSummary } from '../CartSummary';
import { TaxSummary } from '@/types/domain';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts?.rate ? `${key}_${opts.rate}` : key),
  }),
}));

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

jest.mock('@/components/pricing/PriceBreakdown', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    PriceBreakdown: ({ subtotalNet, taxLines, total }: any) => (
      <Text testID="mock-price-breakdown">
        {subtotalNet} | {JSON.stringify(taxLines)} | {total}
      </Text>
    ),
  };
});

describe('CartSummary Component', () => {
  const mockSummary: TaxSummary = {
    subtotal_net: 1000,
    total: 1210,
    taxes: [{ rate: 21, amount: 210, label: 'IVA (21%)', base: 1000 }],
  };

  it('renders correct subtotal, total, and formatted tax lines inside PriceBreakdown', () => {
    const { getByTestId } = render(<CartSummary summary={mockSummary} onPay={jest.fn()} />);

    const priceBreakdown = getByTestId('mock-price-breakdown');
    const childrenString = Array.isArray(priceBreakdown.props.children)
      ? priceBreakdown.props.children.join('')
      : String(priceBreakdown.props.children);

    expect(childrenString).toContain('1000');
    expect(childrenString).toContain('1210');
    expect(childrenString).toContain('pricing.iva_21%');
    expect(childrenString).toContain('210');
  });

  it('renders pay button enabled and calls onPay when clicked', () => {
    const mockOnPay = jest.fn();
    const { getByRole } = render(<CartSummary summary={mockSummary} onPay={mockOnPay} />);

    const payButton = getByRole('button');
    expect(payButton.props.accessibilityState?.disabled).toBe(false);

    fireEvent.press(payButton);
    expect(mockOnPay).toHaveBeenCalledTimes(1);
  });

  it('renders pay button disabled when onPay is undefined', () => {
    const { getByRole } = render(<CartSummary summary={mockSummary} onPay={undefined} />);

    const payButton = getByRole('button');
    expect(payButton.props.accessibilityState?.disabled).toBe(true);

    const mockOnPay = jest.fn();
    fireEvent.press(payButton);
    expect(mockOnPay).not.toHaveBeenCalled();
  });
});
