import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LogoutView } from '../LogoutView';
import { User } from '@/types/auth';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, o?: any) => o?.defaultValue ?? k }),
}));

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children }: any) => <Text>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text>{name}</Text> };
});

jest.mock('@/components/profile/AvatarImage', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: ({ fullName }: any) => <Text>avatar:{fullName}</Text> };
});

jest.mock('@/components/profile/InfoBox', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: ({ text }: any) => <Text>{text}</Text> };
});

jest.mock('@/components/profile/ProfileButton', () => {
  const { Text, Pressable } = require('react-native');
  return {
    __esModule: true,
    default: ({ title, onPress }: any) => (
      <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
  };
});

const user: User = {
  id: 'u1',
  email: 'andrei@uade.edu.ar',
  full_name: 'Andrei Veis',
  avatar_url: null,
  created_at: '2026-01-01T00:00:00Z',
};

describe('LogoutView Component', () => {
  const mockOnLogout = jest.fn().mockResolvedValue(undefined);
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the user name and email', () => {
    const { getByText } = render(
      <LogoutView user={user} onLogout={mockOnLogout} onCancel={mockOnCancel} />,
    );

    expect(getByText('Andrei Veis')).toBeTruthy();
    expect(getByText('andrei@uade.edu.ar')).toBeTruthy();
  });

  it('renders the default name when user is null', () => {
    const { getByText } = render(
      <LogoutView user={null} onLogout={mockOnLogout} onCancel={mockOnCancel} />,
    );

    // Sin usuario, el nombre cae al default (home.defaultUser → "Usuario")
    expect(getByText('avatar:home.defaultUser')).toBeTruthy();
  });

  it('calls onLogout when confirm button is pressed', () => {
    const { getByLabelText } = render(
      <LogoutView user={user} onLogout={mockOnLogout} onCancel={mockOnCancel} />,
    );

    fireEvent.press(getByLabelText('Sí, cerrar sesión'));
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByLabelText } = render(
      <LogoutView user={user} onLogout={mockOnLogout} onCancel={mockOnCancel} />,
    );

    fireEvent.press(getByLabelText('Cancelar'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
