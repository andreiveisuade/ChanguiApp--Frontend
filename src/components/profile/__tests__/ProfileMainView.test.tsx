import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfileMainView } from '../ProfileMainView';
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

jest.mock('@/components/profile/SettingsCard', () => {
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

describe('ProfileMainView Component', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user name and email', () => {
    const { getByText } = render(<ProfileMainView user={user} onNavigate={mockOnNavigate} />);

    expect(getByText('Andrei Veis')).toBeTruthy();
    expect(getByText('andrei@uade.edu.ar')).toBeTruthy();
  });

  it('renders the default name when user is null', () => {
    const { getByText } = render(<ProfileMainView user={null} onNavigate={mockOnNavigate} />);

    // Sin usuario, el nombre cae al default (home.defaultUser → "Usuario")
    expect(getByText('avatar:home.defaultUser')).toBeTruthy();
  });

  it('navigates to edit when edit card is pressed', () => {
    const { getByLabelText } = render(<ProfileMainView user={user} onNavigate={mockOnNavigate} />);

    fireEvent.press(getByLabelText('Editar datos'));
    expect(mockOnNavigate).toHaveBeenCalledWith('edit');
  });

  it('navigates to config when config card is pressed', () => {
    const { getByLabelText } = render(<ProfileMainView user={user} onNavigate={mockOnNavigate} />);

    fireEvent.press(getByLabelText('Configuración'));
    expect(mockOnNavigate).toHaveBeenCalledWith('config');
  });

  it('navigates to logout and delete from account section', () => {
    const { getByLabelText } = render(<ProfileMainView user={user} onNavigate={mockOnNavigate} />);

    fireEvent.press(getByLabelText('Cerrar sesión'));
    expect(mockOnNavigate).toHaveBeenCalledWith('logout');

    fireEvent.press(getByLabelText('Eliminar cuenta'));
    expect(mockOnNavigate).toHaveBeenCalledWith('delete');
  });
});
