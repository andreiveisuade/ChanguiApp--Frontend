import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HomeHeader } from '../HomeHeader';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, opts?: any) => opts?.name ?? key }),
}));

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children }: any) => <Text>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text>{name}</Text> };
});

describe('HomeHeader Component', () => {
  const mockOnProfilePress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders greeting with real first name when userName is provided', () => {
    const { getByText } = render(
      <HomeHeader userName="John Doe" onProfilePress={mockOnProfilePress} />
    );

    expect(getByText('John')).toBeTruthy();
  });

  it('renders greeting with empty string when userName is empty', () => {
    const { queryByText } = render(
      <HomeHeader userName="" onProfilePress={mockOnProfilePress} />
    );

    // Should not contain "John" or "Doe"
    expect(queryByText('John')).toBeNull();
  });

  it('calls onProfilePress when profile icon is pressed', () => {
    const { getByRole } = render(
      <HomeHeader userName="John Doe" onProfilePress={mockOnProfilePress} />
    );

    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnProfilePress).toHaveBeenCalledTimes(1);
  });
});
