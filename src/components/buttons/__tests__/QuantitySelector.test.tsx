import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuantitySelector } from '../QuantitySelector';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts?.value !== undefined ? `${key} ${opts.value}` : key),
  }),
}));

jest.mock('@/components/atoms/AppIcon', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text>{name}</Text> };
});

describe('QuantitySelector Component', () => {
  const mockOnIncrement = jest.fn();
  const mockOnDecrement = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with given value', () => {
    const { getByText } = render(
      <QuantitySelector value={5} onIncrement={mockOnIncrement} onDecrement={mockOnDecrement} />,
    );
    expect(getByText('5')).toBeTruthy();
  });

  it('calls onIncrement when increment button is pressed', () => {
    const { getByLabelText } = render(
      <QuantitySelector value={5} onIncrement={mockOnIncrement} onDecrement={mockOnDecrement} />,
    );
    const incButton = getByLabelText('common.incrementQuantity');
    fireEvent.press(incButton);
    expect(mockOnIncrement).toHaveBeenCalledTimes(1);
  });

  it('calls onDecrement when decrement button is pressed', () => {
    const { getByLabelText } = render(
      <QuantitySelector value={5} onIncrement={mockOnIncrement} onDecrement={mockOnDecrement} />,
    );
    const decButton = getByLabelText('common.decrementQuantity');
    fireEvent.press(decButton);
    expect(mockOnDecrement).toHaveBeenCalledTimes(1);
  });

  it('disables decrement button when value is equal to min', () => {
    const { getByLabelText } = render(
      <QuantitySelector
        value={1}
        min={1}
        onIncrement={mockOnIncrement}
        onDecrement={mockOnDecrement}
      />,
    );
    const decButton = getByLabelText('common.decrementQuantity');
    fireEvent.press(decButton);
    expect(mockOnDecrement).not.toHaveBeenCalled();
    expect(decButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('disables increment button when value is equal to max', () => {
    const { getByLabelText } = render(
      <QuantitySelector
        value={10}
        max={10}
        onIncrement={mockOnIncrement}
        onDecrement={mockOnDecrement}
      />,
    );
    const incButton = getByLabelText('common.incrementQuantity');
    fireEvent.press(incButton);
    expect(mockOnIncrement).not.toHaveBeenCalled();
    expect(incButton.props.accessibilityState?.disabled).toBe(true);
  });
});
