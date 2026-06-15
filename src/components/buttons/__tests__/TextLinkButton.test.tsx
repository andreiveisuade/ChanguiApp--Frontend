import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextLinkButton } from '../TextLinkButton';

describe('TextLinkButton Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title and accessibility role link', () => {
    const { getByText, getByRole } = render(
      <TextLinkButton
        title="Register"
        accessibilityHint="Navigates to registration screen"
        onPress={mockOnPress}
      />,
    );
    expect(getByText('Register')).toBeTruthy();

    const button = getByRole('link');
    expect(button.props.accessibilityHint).toBe('Navigates to registration screen');
  });

  it('calls onPress when clicked', () => {
    const { getByRole } = render(
      <TextLinkButton title="Register" accessibilityHint="Register" onPress={mockOnPress} />,
    );
    const button = getByRole('link');
    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
