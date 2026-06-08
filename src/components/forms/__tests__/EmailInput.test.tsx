import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmailInput } from '../EmailInput';

// Mock child components correctly for default imports
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
    default: ({ message }: any) => message ? <Text testID="inline-error">{message}</Text> : null,
  };
});

describe('EmailInput Component', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default value and label/placeholder', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <EmailInput
        value=""
        onChangeText={mockOnChangeText}
        label="Email"
        placeholder="Enter email"
        accessibilityLabel="Email Input"
        invalidEmailMessage="Email inválido"
      />
    );

    expect(getByTestId('form-label').props.children).toBe('Email');
    expect(getByPlaceholderText('Enter email')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const { getByPlaceholderText } = render(
      <EmailInput
        value=""
        onChangeText={mockOnChangeText}
        label="Email"
        placeholder="Enter email"
        accessibilityLabel="Email Input"
        invalidEmailMessage="Email inválido"
      />
    );

    const input = getByPlaceholderText('Enter email');
    fireEvent.changeText(input, 'test@example.com');
    expect(mockOnChangeText).toHaveBeenCalledWith('test@example.com');
  });

  it('does not show validation error if not touched', () => {
    const { queryByTestId } = render(
      <EmailInput
        value="invalidemail"
        onChangeText={mockOnChangeText}
        label="Email"
        placeholder="Enter email"
        accessibilityLabel="Email Input"
        invalidEmailMessage="Email inválido"
      />
    );

    expect(queryByTestId('inline-error')).toBeNull();
  });

  it('shows validation error if touched (onBlur) and email is invalid', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <EmailInput
        value="invalidemail"
        onChangeText={mockOnChangeText}
        label="Email"
        placeholder="Enter email"
        accessibilityLabel="Email Input"
        invalidEmailMessage="Email inválido"
      />
    );

    const input = getByPlaceholderText('Enter email');
    fireEvent(input, 'blur'); // trigger onBlur to touch the field
    expect(getByTestId('inline-error').props.children).toBe('Email inválido');
  });

  it('shows custom error prop even if untouched', () => {
    const { getByTestId } = render(
      <EmailInput
        value=""
        onChangeText={mockOnChangeText}
        label="Email"
        placeholder="Enter email"
        accessibilityLabel="Email Input"
        invalidEmailMessage="Email inválido"
        error="Email already exists"
      />
    );

    expect(getByTestId('inline-error').props.children).toBe('Email already exists');
  });
});
