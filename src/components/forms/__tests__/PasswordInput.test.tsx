import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PasswordInput } from '../PasswordInput';

// Mock child components correctly for ES module default imports
jest.mock('@/components/forms/FormLabel', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: any) => <Text testID="form-label">{children}</Text>,
  };
});

jest.mock('@/components/forms/InlineError', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ message }: any) => (message ? <Text testID="inline-error">{message}</Text> : null),
  };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text>,
  };
});

jest.mock('@/components/forms/PasswordStrengthIndicator', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ labels, password }: any) => <Text testID="strength-indicator">{password}</Text>,
  };
});

describe('PasswordInput Component', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with secureTextEntry by default', () => {
    const { getByTestId, UNSAFE_getByType } = render(
      <PasswordInput
        value="myPassword"
        onChangeText={mockOnChangeText}
        label="Password"
        accessibilityLabel="Password Input"
        showPasswordLabel="Show Password"
        hidePasswordLabel="Hide Password"
      />,
    );

    const { TextInput } = require('react-native');
    const input = UNSAFE_getByType(TextInput);
    expect(input.props.secureTextEntry).toBe(true);
    expect(getByTestId('app-icon').props.children).toBe('ver');
  });

  it('toggles visibility when eye icon button is pressed', () => {
    const { getByRole, getByTestId, UNSAFE_getByType } = render(
      <PasswordInput
        value="myPassword"
        onChangeText={mockOnChangeText}
        label="Password"
        accessibilityLabel="Password Input"
        showPasswordLabel="Show Password"
        hidePasswordLabel="Hide Password"
      />,
    );

    const { TextInput } = require('react-native');
    const input = UNSAFE_getByType(TextInput);
    const toggleButton = getByRole('button');

    // Toggle to visible
    fireEvent.press(toggleButton);
    expect(input.props.secureTextEntry).toBe(false);
    expect(getByTestId('app-icon').props.children).toBe('ocultar');

    // Toggle back to secure
    fireEvent.press(toggleButton);
    expect(input.props.secureTextEntry).toBe(true);
    expect(getByTestId('app-icon').props.children).toBe('ver');
  });

  it('renders PasswordStrengthIndicator when showStrength is true', () => {
    const strengthLabels = { weak: 'Weak', medium: 'Medium', strong: 'Strong' };
    const { getByTestId } = render(
      <PasswordInput
        value="somePass"
        onChangeText={mockOnChangeText}
        label="Password"
        accessibilityLabel="Password Input"
        showPasswordLabel="Show"
        hidePasswordLabel="Hide"
        showStrength={true}
        strengthLabels={strengthLabels}
      />,
    );

    expect(getByTestId('strength-indicator')).toBeTruthy();
  });

  it('displays the error message if provided', () => {
    const { getByTestId } = render(
      <PasswordInput
        value=""
        onChangeText={mockOnChangeText}
        label="Password"
        accessibilityLabel="Password Input"
        showPasswordLabel="Show"
        hidePasswordLabel="Hide"
        error="Password is too short"
      />,
    );

    expect(getByTestId('inline-error').props.children).toBe('Password is too short');
  });
});
