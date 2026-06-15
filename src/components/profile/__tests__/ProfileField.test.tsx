import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfileField } from '../ProfileField';

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text> };
});

describe('ProfileField Component', () => {
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the label and value', () => {
    const { getByText } = render(<ProfileField label="Email" value="a@b.com" />);
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('a@b.com')).toBeTruthy();
  });

  it('does not render the edit button when onEdit is omitted', () => {
    const { queryByRole } = render(<ProfileField label="Email" value="a@b.com" />);
    expect(queryByRole('button')).toBeNull();
  });

  it('renders the edit button and calls onEdit when pressed', () => {
    const { getByRole } = render(
      <ProfileField label="Email" value="a@b.com" onEdit={mockOnEdit} />,
    );
    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('uses the label as the default accessibility label of the edit button', () => {
    const { getByLabelText } = render(
      <ProfileField label="Email" value="a@b.com" onEdit={mockOnEdit} />,
    );
    expect(getByLabelText('Email')).toBeTruthy();
  });

  it('uses a custom edit accessibility label when provided', () => {
    const { getByLabelText } = render(
      <ProfileField
        label="Email"
        value="a@b.com"
        onEdit={mockOnEdit}
        editAccessibilityLabel="Edit email"
      />,
    );
    expect(getByLabelText('Edit email')).toBeTruthy();
  });
});
