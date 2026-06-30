import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CartItem } from '../CartItem';

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text> };
});

jest.mock('@/components/buttons/QuantitySelector', () => {
  const React = require('react');
  const { View, Button } = require('react-native');
  return {
    QuantitySelector: ({ value, onIncrement, onDecrement }: any) => (
      <View testID="mock-quantity-selector">
        <Button testID="btn-inc" title="+" onPress={onIncrement} />
        <Button testID="btn-dec" title="-" onPress={onDecrement} />
      </View>
    ),
  };
});

describe('CartItem Component', () => {
  const mockOnUpdateQuantity = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders name and price correctly', () => {
    const { getByText } = render(
      <CartItem
        id="item-1"
        name="Product ABC"
        price={150}
        quantity={2}
        imageUrl={null}
        onUpdateQuantity={mockOnUpdateQuantity}
        onDelete={mockOnDelete}
      />,
    );

    expect(getByText('Product ABC')).toBeTruthy();
    expect(getByText('$150')).toBeTruthy();
  });

  it('renders Image component if imageUrl is provided', () => {
    const { UNSAFE_getByType, queryAllByTestId } = render(
      <CartItem
        id="item-1"
        name="Product ABC"
        price={150}
        quantity={2}
        imageUrl="https://example.com/product.png"
        onUpdateQuantity={mockOnUpdateQuantity}
        onDelete={mockOnDelete}
      />,
    );

    const { Image } = require('react-native');
    expect(UNSAFE_getByType(Image)).toBeTruthy();

    // Check that there is no package icon rendered (only the delete icon should be present)
    const icons = queryAllByTestId('app-icon');
    const packageIcon = icons.find((icon) => icon.props.children === 'package');
    expect(packageIcon).toBeUndefined();
  });

  it('calls onUpdateQuantity with incremented value when QuantitySelector signals increment', () => {
    const { getByTestId } = render(
      <CartItem
        id="item-1"
        name="Product ABC"
        price={150}
        quantity={2}
        imageUrl={null}
        onUpdateQuantity={mockOnUpdateQuantity}
        onDelete={mockOnDelete}
      />,
    );

    const incButton = getByTestId('btn-inc');
    fireEvent.press(incButton);
    expect(mockOnUpdateQuantity).toHaveBeenCalledWith('item-1', 3);
  });

  it('calls onUpdateQuantity with decremented value when QuantitySelector signals decrement', () => {
    const { getByTestId } = render(
      <CartItem
        id="item-1"
        name="Product ABC"
        price={150}
        quantity={2}
        imageUrl={null}
        onUpdateQuantity={mockOnUpdateQuantity}
        onDelete={mockOnDelete}
      />,
    );

    const decButton = getByTestId('btn-dec');
    fireEvent.press(decButton);
    expect(mockOnUpdateQuantity).toHaveBeenCalledWith('item-1', 1);
  });

  it('calls onDelete when the delete button is pressed', () => {
    const { getByLabelText } = render(
      <CartItem
        id="item-1"
        name="Product ABC"
        price={150}
        quantity={2}
        imageUrl={null}
        onUpdateQuantity={mockOnUpdateQuantity}
        onDelete={mockOnDelete}
      />,
    );

    const deleteButton = getByLabelText('Eliminar producto del carrito');
    fireEvent.press(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith('item-1');
  });
});
