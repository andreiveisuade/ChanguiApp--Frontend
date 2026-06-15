import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfileHeader } from '../ProfileHeader';

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

describe('ProfileHeader Component', () => {
  const mockOnProfilePress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the greeting with the first name only', () => {
    const { getByText } = render(
      <ProfileHeader userName="John Doe" onProfilePress={mockOnProfilePress} />,
    );
    expect(getByText('John')).toBeTruthy();
  });

  it('renders the greeting key with empty name when userName is empty', () => {
    const { queryByText } = render(
      <ProfileHeader userName="" onProfilePress={mockOnProfilePress} />,
    );
    expect(queryByText('John')).toBeNull();
  });

  it('calls onProfilePress when the profile button is pressed', () => {
    const { getByRole } = render(
      <ProfileHeader userName="John Doe" onProfilePress={mockOnProfilePress} />,
    );
    fireEvent.press(getByRole('button'));
    expect(mockOnProfilePress).toHaveBeenCalledTimes(1);
  });

  it('renders and stays stable when onProfilePress is omitted', () => {
    const { getByRole, getByText } = render(<ProfileHeader userName="John Doe" />);
    expect(getByText('John')).toBeTruthy();
    fireEvent.press(getByRole('button'));
    expect(getByText('John')).toBeTruthy();
  });
});
