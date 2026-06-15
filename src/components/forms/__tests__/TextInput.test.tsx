import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextInput } from '../TextInput';

jest.mock('@/components/forms/FormLabel', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const FormLabel = ({ children }: any) => <Text testID="form-label">{children}</Text>;
  return { __esModule: true, default: FormLabel, FormLabel };
});

jest.mock('@/components/forms/InlineError', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const InlineError = ({ message }: any) =>
    message ? <Text testID="inline-error">{message}</Text> : null;
  return { __esModule: true, default: InlineError, InlineError };
});

describe('TextInput Component', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the label and placeholder', () => {
    const { getByTestId, getByPlaceholderText } = render(
      <TextInput
        label="Nombre"
        placeholder="Ingresá tu nombre"
        value=""
        onChangeText={mockOnChangeText}
      />,
    );

    expect(getByTestId('form-label').props.children).toBe('Nombre');
    expect(getByPlaceholderText('Ingresá tu nombre')).toBeTruthy();
  });

  it('does not render a label when none is provided', () => {
    const { queryByTestId } = render(
      <TextInput placeholder="Ingresá tu nombre" value="" onChangeText={mockOnChangeText} />,
    );

    expect(queryByTestId('form-label')).toBeNull();
  });

  it('calls onChangeText when text changes', () => {
    const { getByPlaceholderText } = render(
      <TextInput placeholder="Ingresá tu nombre" value="" onChangeText={mockOnChangeText} />,
    );

    fireEvent.changeText(getByPlaceholderText('Ingresá tu nombre'), 'Andrei');
    expect(mockOnChangeText).toHaveBeenCalledWith('Andrei');
  });

  it('reflects the value prop', () => {
    const { getByPlaceholderText } = render(
      <TextInput placeholder="Ingresá tu nombre" value="Andrei" onChangeText={mockOnChangeText} />,
    );

    expect(getByPlaceholderText('Ingresá tu nombre').props.value).toBe('Andrei');
  });

  it('does not render an error when none is provided', () => {
    const { queryByTestId } = render(
      <TextInput placeholder="Ingresá tu nombre" value="" onChangeText={mockOnChangeText} />,
    );

    expect(queryByTestId('inline-error')).toBeNull();
  });

  it('renders the error message when provided', () => {
    const { getByTestId } = render(
      <TextInput
        placeholder="Ingresá tu nombre"
        value=""
        onChangeText={mockOnChangeText}
        error="Campo requerido"
      />,
    );

    expect(getByTestId('inline-error').props.children).toBe('Campo requerido');
  });

  it('forwards extra props such as secureTextEntry', () => {
    const { getByPlaceholderText } = render(
      <TextInput
        placeholder="Contraseña"
        value=""
        onChangeText={mockOnChangeText}
        secureTextEntry
      />,
    );

    expect(getByPlaceholderText('Contraseña').props.secureTextEntry).toBe(true);
  });
});
