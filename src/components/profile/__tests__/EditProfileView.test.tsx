import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EditProfileView } from '../EditProfileView';
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

jest.mock('@/components/profile/ProfileInput', () => {
  const { TextInput } = require('react-native');
  return {
    __esModule: true,
    default: ({ label, value, onChangeText }: any) => (
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        editable={!!onChangeText}
      />
    ),
  };
});

jest.mock('@/components/profile/ProfileButton', () => {
  const { Text, Pressable } = require('react-native');
  return {
    __esModule: true,
    default: ({ title, onPress, variant, isLoading }: any) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: variant === 'disabled' }}
        onPress={onPress}
      >
        <Text>{isLoading ? 'loading' : title}</Text>
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

describe('EditProfileView Component', () => {
  const mockOnSave = jest.fn().mockResolvedValue(undefined);
  const mockOnCancel = jest.fn();

  const baseProps = {
    user,
    isSaving: false,
    onSave: mockOnSave,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the current user name and read-only email', () => {
    const { getByDisplayValue } = render(<EditProfileView {...baseProps} />);

    expect(getByDisplayValue('Andrei Veis')).toBeTruthy();
    expect(getByDisplayValue('andrei@uade.edu.ar')).toBeTruthy();
  });

  it('renders empty name input when user is null', () => {
    const { getByLabelText } = render(<EditProfileView {...baseProps} user={null} />);

    expect(getByLabelText('Nombre').props.value).toBe('');
  });

  it('does not call onSave when there are no changes', () => {
    const { getByLabelText } = render(<EditProfileView {...baseProps} />);

    fireEvent.press(getByLabelText('Guardar cambios'));
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('calls onSave with trimmed name and null avatar when name changes', () => {
    const { getByLabelText } = render(<EditProfileView {...baseProps} />);

    fireEvent.changeText(getByLabelText('Nombre'), '  Andrei Nuevo  ');
    fireEvent.press(getByLabelText('Guardar cambios'));

    expect(mockOnSave).toHaveBeenCalledWith({ full_name: 'Andrei Nuevo', avatar_url: null });
  });

  it('toggles the avatar url input when "change photo" is pressed', () => {
    const { getByText, queryByLabelText } = render(<EditProfileView {...baseProps} />);

    expect(queryByLabelText('Foto de perfil (URL)')).toBeNull();
    fireEvent.press(getByText('Cambiar foto'));
    expect(queryByLabelText('Foto de perfil (URL)')).toBeTruthy();
  });

  it('saves the avatar url after editing it through the toggled input', () => {
    const { getByText, getByLabelText } = render(<EditProfileView {...baseProps} />);

    fireEvent.press(getByText('Cambiar foto'));
    fireEvent.changeText(getByLabelText('Foto de perfil (URL)'), 'https://img/avatar.png');
    fireEvent.press(getByLabelText('Guardar cambios'));

    expect(mockOnSave).toHaveBeenCalledWith({
      full_name: 'Andrei Veis',
      avatar_url: 'https://img/avatar.png',
    });
  });

  it('calls onCancel when cancel is pressed', () => {
    const { getByLabelText } = render(<EditProfileView {...baseProps} />);

    fireEvent.press(getByLabelText('Cancelar'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('shows the loading state on the save button while saving', () => {
    const { getByText } = render(<EditProfileView {...baseProps} isSaving={true} />);

    expect(getByText('loading')).toBeTruthy();
  });
});
