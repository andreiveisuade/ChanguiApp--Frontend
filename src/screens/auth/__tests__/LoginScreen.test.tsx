import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';
import useAuth from '@/viewmodels/useAuth';
import { ROUTES } from '@/constants/routes';
import type { AuthError } from '@/types/auth';

jest.mock('@/i18n', () => ({ __esModule: true, default: { t: (key: string) => key } }));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts?.value !== undefined ? `${key} ${opts.value}` : key),
  }),
}));

jest.mock('@/../assets/logos/changuiapp-logo.svg', () => 'ChanguiAppLogo');
jest.mock('@/../assets/icons/google-color.svg', () => 'GoogleColorIcon');

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text> };
});

jest.mock('@/context/AccessibilityContext', () => ({
  useAccessibility: () => ({
    fontScale: 1,
    fontScaleName: 'medium',
    language: 'es',
    setFontScaleName: jest.fn(),
    setLanguage: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { clear: jest.fn() },
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

jest.mock('@/viewmodels/useAuth', () => ({ __esModule: true, default: jest.fn() }));
const mockedUseAuth = jest.mocked(useAuth);

type AuthOverrides = Partial<ReturnType<typeof useAuth>>;

const login = jest.fn();
const loginWithGoogle = jest.fn();
const clearError = jest.fn();

const buildAuth = (overrides: AuthOverrides = {}): ReturnType<typeof useAuth> =>
  ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    login,
    register: jest.fn(),
    loginWithGoogle,
    resetPassword: jest.fn(),
    logout: jest.fn(),
    clearError,
    updateUser: jest.fn(),
    ...overrides,
  }) as unknown as ReturnType<typeof useAuth>;

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue(buildAuth());
  });

  it('renderiza el título y subtítulo de bienvenida', () => {
    const { getByText } = render(<LoginScreen />);

    expect(getByText('auth.login.welcomeTitle')).toBeTruthy();
    expect(getByText('auth.login.subtitle')).toBeTruthy();
  });

  it('muestra el mensaje de error cuando el viewmodel devuelve error', () => {
    const error: AuthError = { message: 'auth.errors.invalidCredentials', field: 'general' };
    mockedUseAuth.mockReturnValue(buildAuth({ error }));

    const { getByText } = render(<LoginScreen />);

    expect(getByText('auth.errors.invalidCredentials')).toBeTruthy();
  });

  it('llama a login con email y password tipeados y navega al home', async () => {
    login.mockResolvedValueOnce(undefined);
    const { getByLabelText, getByA11yHint } = render(<LoginScreen />);

    fireEvent.changeText(getByLabelText('auth.common.emailLabel'), 'andrei@uade.edu.ar');
    fireEvent.changeText(getByLabelText('auth.login.password'), 'secret123');
    fireEvent.press(getByA11yHint('auth.accessibility.loginHint'));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('andrei@uade.edu.ar', 'secret123');
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(ROUTES.tabs.home);
    });
  });

  it('no navega al home si login falla', async () => {
    login.mockRejectedValueOnce(new Error('boom'));
    const { getByLabelText, getByA11yHint } = render(<LoginScreen />);

    fireEvent.changeText(getByLabelText('auth.common.emailLabel'), 'andrei@uade.edu.ar');
    fireEvent.changeText(getByLabelText('auth.login.password'), 'secret123');
    fireEvent.press(getByA11yHint('auth.accessibility.loginHint'));

    await waitFor(() => {
      expect(login).toHaveBeenCalled();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('deshabilita el submit con email inválido', () => {
    const { getByLabelText, getByA11yHint } = render(<LoginScreen />);

    fireEvent.changeText(getByLabelText('auth.common.emailLabel'), 'mal-email');
    fireEvent.changeText(getByLabelText('auth.login.password'), 'secret123');
    fireEvent.press(getByA11yHint('auth.accessibility.loginHint'));

    expect(login).not.toHaveBeenCalled();
  });

  it('llama a loginWithGoogle y navega al home', async () => {
    loginWithGoogle.mockResolvedValueOnce(undefined);
    const { getByA11yHint } = render(<LoginScreen />);

    fireEvent.press(getByA11yHint('auth.accessibility.googleHint'));

    await waitFor(() => {
      expect(loginWithGoogle).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(ROUTES.tabs.home);
    });
  });

  it('navega a forgot password al tocar el link', () => {
    const { getByA11yHint } = render(<LoginScreen />);

    fireEvent.press(getByA11yHint('auth.accessibility.goToForgotPasswordHint'));

    expect(mockPush).toHaveBeenCalledWith(ROUTES.auth.forgotPassword);
  });

  it('navega a register al tocar crear cuenta', () => {
    const { getByA11yHint } = render(<LoginScreen />);

    fireEvent.press(getByA11yHint('auth.accessibility.goToRegisterHint'));

    expect(mockPush).toHaveBeenCalledWith(ROUTES.auth.register);
  });

  it('limpia el error al cerrar el mensaje', () => {
    const error: AuthError = { message: 'auth.errors.invalidCredentials', field: 'general' };
    mockedUseAuth.mockReturnValue(buildAuth({ error }));

    const { getByA11yHint } = render(<LoginScreen />);

    fireEvent.press(getByA11yHint('auth.accessibility.dismissError'));

    expect(clearError).toHaveBeenCalled();
  });
});
