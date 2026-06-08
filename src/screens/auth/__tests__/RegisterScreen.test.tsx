import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RegisterScreen } from '../RegisterScreen';
import useAuth from '@/viewmodels/useAuth';
import { ROUTES } from '@/constants/routes';
import type { AuthError } from '@/types/auth';

jest.mock('@/i18n', () => ({ __esModule: true, default: { t: (key: string) => key } }));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts?.value !== undefined ? `${key} ${opts.value}` : key),
  }),
}));

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

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

jest.mock('@/viewmodels/useAuth', () => ({ __esModule: true, default: jest.fn() }));
const mockedUseAuth = jest.mocked(useAuth);

type AuthOverrides = Partial<ReturnType<typeof useAuth>>;

const register = jest.fn();
const clearError = jest.fn();

const buildAuth = (overrides: AuthOverrides = {}): ReturnType<typeof useAuth> =>
  ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    login: jest.fn(),
    register,
    loginWithGoogle: jest.fn(),
    resetPassword: jest.fn(),
    logout: jest.fn(),
    clearError,
    updateUser: jest.fn(),
    ...overrides,
  }) as unknown as ReturnType<typeof useAuth>;

const fillValidForm = (utils: ReturnType<typeof render>): void => {
  fireEvent.changeText(utils.getByLabelText('auth.register.fullName'), 'Andrei Veis');
  fireEvent.changeText(utils.getByLabelText('auth.common.emailLabel'), 'andrei@uade.edu.ar');
  fireEvent.changeText(utils.getByLabelText('auth.register.password'), 'secret123');
  fireEvent.changeText(utils.getByLabelText('auth.register.confirmPassword'), 'secret123');
};

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue(buildAuth());
  });

  it('renderiza el título y subtítulo', () => {
    const { getByText } = render(<RegisterScreen />);

    expect(getByText('auth.register.title')).toBeTruthy();
    expect(getByText('auth.register.subtitle')).toBeTruthy();
  });

  it('muestra el mensaje de error del viewmodel', () => {
    const error: AuthError = { message: 'auth.errors.emailTaken', field: 'email' };
    mockedUseAuth.mockReturnValue(buildAuth({ error }));

    const { getAllByText } = render(<RegisterScreen />);

    expect(getAllByText('auth.errors.emailTaken').length).toBeGreaterThan(0);
  });

  it('llama a register con las credenciales tipeadas y navega al home', async () => {
    register.mockResolvedValueOnce(undefined);
    const utils = render(<RegisterScreen />);

    fillValidForm(utils);
    fireEvent.press(utils.getByA11yHint('auth.accessibility.registerHint'));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        full_name: 'Andrei Veis',
        email: 'andrei@uade.edu.ar',
        password: 'secret123',
        confirmPassword: 'secret123',
      });
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(ROUTES.tabs.home);
    });
  });

  it('no navega al home si register falla', async () => {
    register.mockRejectedValueOnce(new Error('boom'));
    const utils = render(<RegisterScreen />);

    fillValidForm(utils);
    fireEvent.press(utils.getByA11yHint('auth.accessibility.registerHint'));

    await waitFor(() => {
      expect(register).toHaveBeenCalled();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('no llama a register si las contraseñas no coinciden', () => {
    const utils = render(<RegisterScreen />);

    fireEvent.changeText(utils.getByLabelText('auth.register.fullName'), 'Andrei Veis');
    fireEvent.changeText(utils.getByLabelText('auth.common.emailLabel'), 'andrei@uade.edu.ar');
    fireEvent.changeText(utils.getByLabelText('auth.register.password'), 'secret123');
    fireEvent.changeText(utils.getByLabelText('auth.register.confirmPassword'), 'otra');
    fireEvent.press(utils.getByA11yHint('auth.accessibility.registerHint'));

    expect(register).not.toHaveBeenCalled();
  });

  it('navega a login al tocar el link de iniciar sesión', () => {
    const { getByA11yHint } = render(<RegisterScreen />);

    fireEvent.press(getByA11yHint('auth.accessibility.goToLoginHint'));

    expect(mockPush).toHaveBeenCalledWith(ROUTES.auth.login);
  });

  it('limpia el error al cerrar el mensaje', () => {
    const error: AuthError = { message: 'auth.errors.emailTaken', field: 'general' };
    mockedUseAuth.mockReturnValue(buildAuth({ error }));

    const { getByA11yHint } = render(<RegisterScreen />);

    fireEvent.press(getByA11yHint('auth.accessibility.dismissError'));

    expect(clearError).toHaveBeenCalled();
  });
});
