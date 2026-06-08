import React from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react-native';
import ProfileScreen from '../ProfileScreen';
import useAuth from '@/viewmodels/useAuth';
import useProfile from '@/viewmodels/useProfile';
import { User } from '@/types/auth';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o?.value !== undefined ? `${k} ${o.value}` : k),
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { setItem: jest.fn(), getItem: jest.fn(), removeItem: jest.fn() },
}));

jest.mock('@/viewmodels/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/viewmodels/useProfile', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Componentes hijos pesados: se reemplazan por stubs livianos que exponen los
// handlers que ProfileScreen les pasa, para poder testear navegación y acciones.
jest.mock('@/components/profile/ProfileHeader', () => {
  const { Text, Pressable } = require('react-native');
  return {
    __esModule: true,
    default: ({ userName, onProfilePress }: any) => (
      <Pressable testID="header" onPress={onProfilePress}>
        <Text>{userName}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/components/profile/ProfileMainView', () => {
  const { Text, Pressable, View } = require('react-native');
  return {
    __esModule: true,
    default: ({ user, onNavigate }: any) => (
      <View testID="main-view">
        <Text>{user?.full_name ?? 'no-user'}</Text>
        <Pressable testID="go-edit" onPress={() => onNavigate('edit')} />
        <Pressable testID="go-config" onPress={() => onNavigate('config')} />
        <Pressable testID="go-logout" onPress={() => onNavigate('logout')} />
        <Pressable testID="go-delete" onPress={() => onNavigate('delete')} />
      </View>
    ),
  };
});

jest.mock('@/components/profile/EditProfileView', () => {
  const { Pressable, View } = require('react-native');
  return {
    __esModule: true,
    default: ({ onSave, onCancel }: any) => (
      <View testID="edit-view">
        <Pressable
          testID="edit-save"
          onPress={() => onSave({ full_name: 'Nuevo Nombre', avatar_url: null })}
        />
        <Pressable testID="edit-cancel" onPress={onCancel} />
      </View>
    ),
  };
});

jest.mock('@/components/profile/ConfigView', () => {
  const { Pressable, View } = require('react-native');
  return {
    __esModule: true,
    default: ({ onBack }: any) => (
      <View testID="config-view">
        <Pressable testID="config-back" onPress={onBack} />
      </View>
    ),
  };
});

jest.mock('@/components/profile/LogoutView', () => {
  const { Pressable, View } = require('react-native');
  return {
    __esModule: true,
    default: ({ onLogout, onCancel }: any) => (
      <View testID="logout-view">
        <Pressable testID="logout-confirm" onPress={onLogout} />
        <Pressable testID="logout-cancel" onPress={onCancel} />
      </View>
    ),
  };
});

jest.mock('@/components/profile/DeleteAccountView', () => {
  const { Pressable, View } = require('react-native');
  return {
    __esModule: true,
    default: ({ onDelete, onCancel, onNavigateToLogout }: any) => (
      <View testID="delete-view">
        <Pressable testID="delete-confirm" onPress={onDelete} />
        <Pressable testID="delete-cancel" onPress={onCancel} />
        <Pressable testID="delete-to-logout" onPress={onNavigateToLogout} />
      </View>
    ),
  };
});

jest.mock('@/components/feedback/LoadingOverlay', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ visible }: any) => (visible ? <View testID="loading-overlay" /> : null),
  };
});

jest.mock('@/components/feedback/ErrorMessage', () => {
  const { Text, Pressable } = require('react-native');
  return {
    __esModule: true,
    default: ({ message, onClose }: any) =>
      message ? (
        <Pressable testID="error-message" onPress={onClose}>
          <Text>{message}</Text>
        </Pressable>
      ) : null,
  };
});

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseProfile = jest.mocked(useProfile);

const user: User = {
  id: 'u1',
  email: 'andrei@uade.edu.ar',
  full_name: 'Andrei Veis',
  avatar_url: null,
  created_at: '2026-01-01T00:00:00Z',
};

const logout = jest.fn();
const updateProfile = jest.fn();
const deleteProfile = jest.fn();
const clearError = jest.fn();

const setProfileReturn = (overrides: Partial<ReturnType<typeof useProfile>> = {}) => {
  mockedUseProfile.mockReturnValue({
    profile: user,
    isLoading: false,
    isSaving: false,
    isDeleting: false,
    error: null,
    updateProfile,
    deleteProfile,
    clearError,
    ...overrides,
  } as any);
};

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logout.mockResolvedValue(undefined);
    updateProfile.mockResolvedValue(undefined);
    deleteProfile.mockResolvedValue(undefined);
    mockedUseAuth.mockReturnValue({ logout } as any);
    setProfileReturn();
  });

  it('muestra la vista main por defecto con el nombre del usuario', () => {
    const { getByTestId } = render(<ProfileScreen />);

    const mainView = getByTestId('main-view');
    expect(mainView).toBeTruthy();
    expect(within(mainView).getByText('Andrei Veis')).toBeTruthy();
  });

  it('muestra el LoadingOverlay mientras carga', () => {
    setProfileReturn({ isLoading: true });
    const { getByTestId } = render(<ProfileScreen />);

    expect(getByTestId('loading-overlay')).toBeTruthy();
  });

  it('navega de main a edit, config, logout y delete', () => {
    const { getByTestId, queryByTestId } = render(<ProfileScreen />);

    fireEvent.press(getByTestId('go-edit'));
    expect(getByTestId('edit-view')).toBeTruthy();
    expect(queryByTestId('main-view')).toBeNull();

    fireEvent.press(getByTestId('header'));
    expect(getByTestId('main-view')).toBeTruthy();

    fireEvent.press(getByTestId('go-config'));
    expect(getByTestId('config-view')).toBeTruthy();

    fireEvent.press(getByTestId('config-back'));
    fireEvent.press(getByTestId('go-logout'));
    expect(getByTestId('logout-view')).toBeTruthy();

    fireEvent.press(getByTestId('logout-cancel'));
    fireEvent.press(getByTestId('go-delete'));
    expect(getByTestId('delete-view')).toBeTruthy();
  });

  it('header vuelve siempre a la vista main', () => {
    const { getByTestId } = render(<ProfileScreen />);

    fireEvent.press(getByTestId('go-delete'));
    expect(getByTestId('delete-view')).toBeTruthy();

    fireEvent.press(getByTestId('header'));
    expect(getByTestId('main-view')).toBeTruthy();
  });

  it('guardar en edit llama updateProfile y vuelve a main', async () => {
    const { getByTestId } = render(<ProfileScreen />);

    fireEvent.press(getByTestId('go-edit'));
    fireEvent.press(getByTestId('edit-save'));

    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith({
        full_name: 'Nuevo Nombre',
        avatar_url: null,
      }),
    );
    await waitFor(() => expect(getByTestId('main-view')).toBeTruthy());
  });

  it('si updateProfile falla, permanece en la vista edit', async () => {
    updateProfile.mockRejectedValueOnce(new Error('boom'));
    const { getByTestId } = render(<ProfileScreen />);

    fireEvent.press(getByTestId('go-edit'));
    fireEvent.press(getByTestId('edit-save'));

    await waitFor(() => expect(updateProfile).toHaveBeenCalled());
    expect(getByTestId('edit-view')).toBeTruthy();
  });

  it('cancelar en edit limpia el error y vuelve a main', () => {
    const { getByTestId } = render(<ProfileScreen />);

    fireEvent.press(getByTestId('go-edit'));
    fireEvent.press(getByTestId('edit-cancel'));

    expect(clearError).toHaveBeenCalled();
    expect(getByTestId('main-view')).toBeTruthy();
  });

  it('confirmar logout llama a logout', async () => {
    const { getByTestId } = render(<ProfileScreen />);

    fireEvent.press(getByTestId('go-logout'));
    fireEvent.press(getByTestId('logout-confirm'));

    await waitFor(() => expect(logout).toHaveBeenCalled());
  });

  it('si logout falla, vuelve a la vista main', async () => {
    logout.mockRejectedValueOnce(new Error('net'));
    const { getByTestId } = render(<ProfileScreen />);

    fireEvent.press(getByTestId('go-logout'));
    fireEvent.press(getByTestId('logout-confirm'));

    await waitFor(() => expect(getByTestId('main-view')).toBeTruthy());
  });

  it('confirmar delete llama deleteProfile y luego logout', async () => {
    const { getByTestId } = render(<ProfileScreen />);

    fireEvent.press(getByTestId('go-delete'));
    fireEvent.press(getByTestId('delete-confirm'));

    await waitFor(() => expect(deleteProfile).toHaveBeenCalled());
    await waitFor(() => expect(logout).toHaveBeenCalled());
  });

  it('si deleteProfile falla, no llama a logout y vuelve a main', async () => {
    deleteProfile.mockRejectedValueOnce(new Error('boom'));
    const { getByTestId } = render(<ProfileScreen />);

    fireEvent.press(getByTestId('go-delete'));
    fireEvent.press(getByTestId('delete-confirm'));

    await waitFor(() => expect(deleteProfile).toHaveBeenCalled());
    expect(logout).not.toHaveBeenCalled();
    await waitFor(() => expect(getByTestId('main-view')).toBeTruthy());
  });

  it('delete puede derivar a la vista de logout', () => {
    const { getByTestId } = render(<ProfileScreen />);

    fireEvent.press(getByTestId('go-delete'));
    fireEvent.press(getByTestId('delete-to-logout'));

    expect(getByTestId('logout-view')).toBeTruthy();
  });

  it('muestra el ErrorMessage y permite cerrarlo', () => {
    setProfileReturn({ error: { message: 'Algo salió mal' } });
    const { getByTestId, getByText } = render(<ProfileScreen />);

    expect(getByText('Algo salió mal')).toBeTruthy();
    fireEvent.press(getByTestId('error-message'));
    expect(clearError).toHaveBeenCalled();
  });

  it('usa el nombre por defecto cuando no hay perfil', () => {
    setProfileReturn({ profile: null });
    const { getByText } = render(<ProfileScreen />);

    expect(getByText('home.defaultUser')).toBeTruthy();
  });
});
