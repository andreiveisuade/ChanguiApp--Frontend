import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GoogleSignInButton } from '../GoogleSignInButton';

// Mock SVG import
jest.mock('@/../assets/icons/google-color.svg', () => 'GoogleColorIcon');

describe('GoogleSignInButton Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title and accessibility props', () => {
    const { getByText, getByRole } = render(
      <GoogleSignInButton
        title="Sign in with Google"
        accessibilityHint="Sign in using your Google account"
        onPress={mockOnPress}
      />
    );
    expect(getByText('Sign in with Google')).toBeTruthy();
    
    const button = getByRole('button');
    expect(button.props.accessibilityHint).toBe('Sign in using your Google account');
  });

  it('calls onPress when clicked and not disabled', () => {
    const { getByRole } = render(
      <GoogleSignInButton
        title="Sign in with Google"
        accessibilityHint="Sign in"
        onPress={mockOnPress}
      />
    );
    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByRole } = render(
      <GoogleSignInButton
        title="Sign in with Google"
        accessibilityHint="Sign in"
        onPress={mockOnPress}
        disabled={true}
      />
    );
    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });
});
