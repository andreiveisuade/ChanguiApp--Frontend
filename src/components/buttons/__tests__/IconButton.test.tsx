import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IconButton } from '../IconButton';

jest.mock('@/components/atoms/AppIcon', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text>,
  };
});

describe('IconButton Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the icon and accessibility props', () => {
    const { getByRole, getByTestId } = render(
      <IconButton icon="cerrar" onPress={mockOnPress} accessibilityLabel="Cerrar" />,
    );

    expect(getByTestId('app-icon').props.children).toBe('cerrar');

    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Cerrar');
  });

  it('calls onPress when pressed and not disabled', () => {
    const { getByRole } = render(
      <IconButton icon="cerrar" onPress={mockOnPress} accessibilityLabel="Cerrar" />,
    );

    fireEvent.press(getByRole('button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByRole } = render(
      <IconButton
        icon="cerrar"
        onPress={mockOnPress}
        accessibilityLabel="Cerrar"
        disabled={true}
      />,
    );

    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });
});
