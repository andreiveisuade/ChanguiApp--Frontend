import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DestructiveButton } from '../DestructiveButton';

describe('DestructiveButton Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title and accessibility props', () => {
    const { getByText, getByRole } = render(
      <DestructiveButton
        title="Eliminar"
        accessibilityHint="Elimina la cuenta"
        onPress={mockOnPress}
      />
    );

    expect(getByText('Eliminar')).toBeTruthy();

    const button = getByRole('button');
    expect(button.props.accessibilityHint).toBe('Elimina la cuenta');
  });

  it('calls onPress when clicked and not disabled/loading', () => {
    const { getByRole } = render(
      <DestructiveButton
        title="Eliminar"
        accessibilityHint="Elimina"
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByRole('button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByRole } = render(
      <DestructiveButton
        title="Eliminar"
        accessibilityHint="Elimina"
        onPress={mockOnPress}
        disabled={true}
      />
    );

    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });

  it('renders ActivityIndicator and does not call onPress when isLoading is true', () => {
    const { getByRole, queryByText } = render(
      <DestructiveButton
        title="Eliminar"
        accessibilityHint="Elimina"
        onPress={mockOnPress}
        isLoading={true}
      />
    );

    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
    expect(queryByText('Eliminar')).toBeNull();
  });
});
