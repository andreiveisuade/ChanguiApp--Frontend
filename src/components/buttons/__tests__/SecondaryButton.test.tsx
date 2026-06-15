import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SecondaryButton } from '../SecondaryButton';

describe('SecondaryButton Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title and accessibility props', () => {
    const { getByText, getByRole } = render(
      <SecondaryButton
        title="Cancel"
        accessibilityHint="Cancels the action"
        onPress={mockOnPress}
      />,
    );
    expect(getByText('Cancel')).toBeTruthy();

    const button = getByRole('button');
    expect(button.props.accessibilityHint).toBe('Cancels the action');
  });

  it('calls onPress when clicked and not disabled/loading', () => {
    const { getByRole } = render(
      <SecondaryButton title="Cancel" accessibilityHint="Cancels" onPress={mockOnPress} />,
    );
    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByRole } = render(
      <SecondaryButton
        title="Cancel"
        accessibilityHint="Cancels"
        onPress={mockOnPress}
        disabled={true}
      />,
    );
    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });

  it('renders ActivityIndicator and does not call onPress when isLoading is true', () => {
    const { getByRole, queryByText } = render(
      <SecondaryButton
        title="Cancel"
        accessibilityHint="Cancels"
        onPress={mockOnPress}
        isLoading={true}
      />,
    );
    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
    expect(queryByText('Cancel')).toBeNull();
  });
});
