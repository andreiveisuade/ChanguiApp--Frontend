import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { FormField } from '../FormField';

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

describe('FormField Component', () => {
  it('renders the label and children', () => {
    const { getByTestId, getByText } = render(
      <FormField label="Nombre">
        <Text>Child content</Text>
      </FormField>,
    );

    expect(getByTestId('form-label').props.children).toBe('Nombre');
    expect(getByText('Child content')).toBeTruthy();
  });

  it('does not render an error when none is provided', () => {
    const { queryByTestId } = render(
      <FormField label="Nombre">
        <Text>Child content</Text>
      </FormField>,
    );

    expect(queryByTestId('inline-error')).toBeNull();
  });

  it('renders the error message when provided', () => {
    const { getByTestId } = render(
      <FormField label="Nombre" error="Campo requerido">
        <Text>Child content</Text>
      </FormField>,
    );

    expect(getByTestId('inline-error').props.children).toBe('Campo requerido');
  });

  it('does not render an error when error is null', () => {
    const { queryByTestId } = render(
      <FormField label="Nombre" error={null}>
        <Text>Child content</Text>
      </FormField>,
    );

    expect(queryByTestId('inline-error')).toBeNull();
  });
});
