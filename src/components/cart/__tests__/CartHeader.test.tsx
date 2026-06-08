import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CartHeader } from '../CartHeader';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, opts?: any) => opts?.name ?? key }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: ({ children }: any) => <View>{children}</View> };
});

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children }: any) => <Text>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text>{name}</Text> };
});

describe('CartHeader Component', () => {
  const mockOnProfilePress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders greeting with the first name only when userName is provided', () => {
    const { getByText } = render(
      <CartHeader userName="John Doe" onProfilePress={mockOnProfilePress} />
    );

    expect(getByText('John')).toBeTruthy();
  });

  it('renders an empty greeting when userName is empty', () => {
    const { queryByText } = render(
      <CartHeader userName="" onProfilePress={mockOnProfilePress} />
    );

    expect(queryByText('John')).toBeNull();
  });

  it('calls onProfilePress when the profile button is pressed', () => {
    const { getByRole } = render(
      <CartHeader userName="John Doe" onProfilePress={mockOnProfilePress} />
    );

    fireEvent.press(getByRole('button'));
    expect(mockOnProfilePress).toHaveBeenCalledTimes(1);
  });
});
