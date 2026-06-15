import React from 'react';
import { render } from '@testing-library/react-native';
import { ConfirmPasswordInput } from '../ConfirmPasswordInput';

// Mock PasswordInput to inspect props passed to it
jest.mock('@/components/forms/PasswordInput', () => {
  const { Text } = require('react-native');
  return (props: any) => (
    <Text testID="password-input" error={props.error} value={props.value}>
      {props.label}
    </Text>
  );
});

describe('ConfirmPasswordInput Component', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and does not show mismatch error if passwords match', () => {
    const { getByTestId } = render(
      <ConfirmPasswordInput
        value="password123"
        password="password123"
        onChangeText={mockOnChangeText}
        label="Confirm Password"
        accessibilityLabel="Confirm Password Input"
        showPasswordLabel="Show"
        hidePasswordLabel="Hide"
        mismatchMessage="Contraseñas no coinciden"
      />,
    );

    const mockedInput = getByTestId('password-input');
    expect(mockedInput.props.error).toBeNull();
    expect(mockedInput.props.value).toBe('password123');
  });

  it('shows mismatch error if passwords do not match and value is not empty', () => {
    const { getByTestId } = render(
      <ConfirmPasswordInput
        value="different123"
        password="password123"
        onChangeText={mockOnChangeText}
        label="Confirm Password"
        accessibilityLabel="Confirm Password Input"
        showPasswordLabel="Show"
        hidePasswordLabel="Hide"
        mismatchMessage="Contraseñas no coinciden"
      />,
    );

    const mockedInput = getByTestId('password-input');
    expect(mockedInput.props.error).toBe('Contraseñas no coinciden');
  });

  it('does not show mismatch error if value is empty', () => {
    const { getByTestId } = render(
      <ConfirmPasswordInput
        value=""
        password="password123"
        onChangeText={mockOnChangeText}
        label="Confirm Password"
        accessibilityLabel="Confirm Password Input"
        showPasswordLabel="Show"
        hidePasswordLabel="Hide"
        mismatchMessage="Contraseñas no coinciden"
      />,
    );

    const mockedInput = getByTestId('password-input');
    expect(mockedInput.props.error).toBeNull();
  });

  it('prioritizes custom error prop over mismatch validation error', () => {
    const { getByTestId } = render(
      <ConfirmPasswordInput
        value="different123"
        password="password123"
        onChangeText={mockOnChangeText}
        label="Confirm Password"
        accessibilityLabel="Confirm Password Input"
        showPasswordLabel="Show"
        hidePasswordLabel="Hide"
        mismatchMessage="Contraseñas no coinciden"
        error="Custom error message"
      />,
    );

    const mockedInput = getByTestId('password-input');
    expect(mockedInput.props.error).toBe('Custom error message');
  });
});
