import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FullNameInput } from '../FullNameInput';

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
    default: ({ message }: any) => (message ? <Text testID="inline-error">{message}</Text> : null),
  };
});

describe('FullNameInput Component', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with label and empty value', () => {
    const { getByTestId, UNSAFE_getByType } = render(
      <FullNameInput
        value=""
        onChangeText={mockOnChangeText}
        label="Full Name"
        accessibilityLabel="Full Name Input"
        nameTooShortMessage="Nombre demasiado corto"
      />,
    );

    expect(getByTestId('form-label').props.children).toBe('Full Name');

    const { TextInput } = require('react-native');
    const input = UNSAFE_getByType(TextInput);
    expect(input.props.value).toBe('');
  });

  it('calls onChangeText when changing name value', () => {
    const { UNSAFE_getByType } = render(
      <FullNameInput
        value=""
        onChangeText={mockOnChangeText}
        label="Full Name"
        accessibilityLabel="Full Name Input"
        nameTooShortMessage="Nombre demasiado corto"
      />,
    );

    const { TextInput } = require('react-native');
    const input = UNSAFE_getByType(TextInput);
    fireEvent.changeText(input, 'Jane Doe');
    expect(mockOnChangeText).toHaveBeenCalledWith('Jane Doe');
  });

  it('does not display validation error if untouched', () => {
    const { queryByTestId } = render(
      <FullNameInput
        value="A"
        onChangeText={mockOnChangeText}
        label="Full Name"
        accessibilityLabel="Full Name Input"
        nameTooShortMessage="Nombre demasiado corto"
      />,
    );

    expect(queryByTestId('inline-error')).toBeNull();
  });

  it('displays validation error if touched (onBlur) and name is too short', () => {
    const { getByTestId, UNSAFE_getByType } = render(
      <FullNameInput
        value="A"
        onChangeText={mockOnChangeText}
        label="Full Name"
        accessibilityLabel="Full Name Input"
        nameTooShortMessage="Nombre demasiado corto"
      />,
    );

    const { TextInput } = require('react-native');
    const input = UNSAFE_getByType(TextInput);
    fireEvent(input, 'blur');

    expect(getByTestId('inline-error').props.children).toBe('Nombre demasiado corto');
  });

  it('displays custom error prop when provided', () => {
    const { getByTestId } = render(
      <FullNameInput
        value=""
        onChangeText={mockOnChangeText}
        label="Full Name"
        accessibilityLabel="Full Name Input"
        nameTooShortMessage="Nombre demasiado corto"
        error="Invalid characters"
      />,
    );

    expect(getByTestId('inline-error').props.children).toBe('Invalid characters');
  });
});
