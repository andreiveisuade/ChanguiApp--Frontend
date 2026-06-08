import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PrimaryButton } from '../PrimaryButton';

describe('PrimaryButton Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title and accessibility props', () => {
    const { getByText, getByRole } = render(
      <PrimaryButton
        title="Submit"
        accessibilityHint="Submits the form"
        onPress={mockOnPress}
      />
    );
    expect(getByText('Submit')).toBeTruthy();
    
    const button = getByRole('button');
    expect(button.props.accessibilityHint).toBe('Submits the form');
  });

  it('calls onPress when clicked and not disabled/loading', () => {
    const { getByRole } = render(
      <PrimaryButton
        title="Submit"
        accessibilityHint="Submits"
        onPress={mockOnPress}
      />
    );
    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByRole } = render(
      <PrimaryButton
        title="Submit"
        accessibilityHint="Submits"
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
      <PrimaryButton
        title="Submit"
        accessibilityHint="Submits"
        onPress={mockOnPress}
        isLoading={true}
      />
    );
    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
    expect(queryByText('Submit')).toBeNull();
  });
});
