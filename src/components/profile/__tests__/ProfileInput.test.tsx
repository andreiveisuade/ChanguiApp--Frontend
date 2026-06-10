import React from 'react';
import { TextInput } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfileInput } from '../ProfileInput';

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text> };
});

jest.mock('@/components/forms/FormLabel', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: any) => <Text>{children}</Text>,
    FormLabel: ({ children }: any) => <Text>{children}</Text>,
  };
});

jest.mock('@/components/forms/InlineError', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ message }: any) =>
      message ? <Text testID="inline-error">{message}</Text> : null,
    InlineError: ({ message }: any) =>
      message ? <Text testID="inline-error">{message}</Text> : null,
  };
});

describe('ProfileInput Component', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the label, value and icon', () => {
    const { getByText, getByDisplayValue, getByTestId } = render(
      <ProfileInput label="Email" value="a@b.com" iconName="mail" />
    );
    expect(getByText('Email')).toBeTruthy();
    expect(getByDisplayValue('a@b.com')).toBeTruthy();
    expect(getByTestId('app-icon').props.children).toBe('mail');
  });

  it('calls onChangeText when the text changes', () => {
    const { UNSAFE_getByType } = render(
      <ProfileInput
        label="Email"
        value=""
        iconName="mail"
        onChangeText={mockOnChangeText}
      />
    );
    fireEvent.changeText(UNSAFE_getByType(TextInput), 'hello');
    expect(mockOnChangeText).toHaveBeenCalledWith('hello');
  });

  it('renders the inline error when an error is provided', () => {
    const { getByTestId } = render(
      <ProfileInput
        label="Email"
        value="bad"
        iconName="mail"
        error="Invalid email"
      />
    );
    expect(getByTestId('inline-error').props.children).toBe('Invalid email');
  });

  it('does not render an inline error when error is null', () => {
    const { queryByTestId } = render(
      <ProfileInput label="Email" value="a@b.com" iconName="mail" error={null} />
    );
    expect(queryByTestId('inline-error')).toBeNull();
  });

  it('marks the TextInput as non-editable when editable is false', () => {
    const { UNSAFE_getByType } = render(
      <ProfileInput label="Email" value="a@b.com" iconName="mail" editable={false} />
    );
    expect(UNSAFE_getByType(TextInput).props.editable).toBe(false);
  });

  it('forwards keyboardType and autoCapitalize to the TextInput', () => {
    const { UNSAFE_getByType } = render(
      <ProfileInput
        label="Email"
        value=""
        iconName="mail"
        keyboardType="email-address"
        autoCapitalize="none"
      />
    );
    const input = UNSAFE_getByType(TextInput);
    expect(input.props.keyboardType).toBe('email-address');
    expect(input.props.autoCapitalize).toBe('none');
  });
});
