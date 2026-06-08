import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ForgotPasswordScreen } from '../ForgotPasswordScreen';
import useAuth from '@/viewmodels/useAuth';
import { ROUTES } from '@/constants/routes';

jest.mock('@/i18n', () => ({ __esModule: true, default: { t: (key: string) => key } }));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts?.value !== undefined ? `${key} ${opts.value}` : key),
  }),
}));

jest.mock('@/../assets/logos/changuiapp-logo.svg', () => 'ChanguiAppLogo');

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

const resetPassword = jest.fn();

const buildAuth = (overrides: AuthOverrides = {}): ReturnType<typeof useAuth> =>
  ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    loginWithGoogle: jest.fn(),
    resetPassword,
    logout: jest.fn(),
    clearError: jest.fn(),
    updateUser: jest.fn(),
    ...overrides,
  }) as unknown as ReturnType<typeof useAuth>;

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue(buildAuth());
  });

  it('renderiza el título y subtítulo del formulario', () => {
    const { getByText } = render(<ForgotPasswordScreen />);

    expect(getByText('forgotPassword.title')).toBeTruthy();
    expect(getByText('forgotPassword.subtitle')).toBeTruthy();
  });

  it('muestra el label de envío mientras isLoading es true', () => {
    mockedUseAuth.mockReturnValue(buildAuth({ isLoading: true }));

    const { getByText, queryByText } = render(<ForgotPasswordScreen />);

    expect(getByText('forgotPassword.sending')).toBeTruthy();
    expect(queryByText('forgotPassword.submit')).toBeNull();
  });

  it('llama a resetPassword con el email tipeado', async () => {
    resetPassword.mockResolvedValueOnce(true);
    const { getByLabelText, getByA11yHint } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByLabelText('forgotPassword.email'), 'andrei@uade.edu.ar');
    fireEvent.press(getByA11yHint('forgotPassword.submit'));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith('andrei@uade.edu.ar');
    });
  });

  it('muestra la pantalla de confirmación cuando resetPassword devuelve true', async () => {
    resetPassword.mockResolvedValueOnce(true);
    const { getByLabelText, getByA11yHint, findByText } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByLabelText('forgotPassword.email'), 'andrei@uade.edu.ar');
    fireEvent.press(getByA11yHint('forgotPassword.submit'));

    expect(await findByText('forgotPassword.sentTitle')).toBeTruthy();
  });

  it('no muestra la confirmación si resetPassword devuelve false', async () => {
    resetPassword.mockResolvedValueOnce(false);
    const { getByLabelText, getByA11yHint, queryByText } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByLabelText('forgotPassword.email'), 'mal-email');
    fireEvent.press(getByA11yHint('forgotPassword.submit'));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalled();
    });
    expect(queryByText('forgotPassword.sentTitle')).toBeNull();
  });

  it('vuelve al login desde la pantalla de confirmación', async () => {
    resetPassword.mockResolvedValueOnce(true);
    const { getByLabelText, getByA11yHint, findByText, getByText } = render(
      <ForgotPasswordScreen />,
    );

    fireEvent.changeText(getByLabelText('forgotPassword.email'), 'andrei@uade.edu.ar');
    fireEvent.press(getByA11yHint('forgotPassword.submit'));

    await findByText('forgotPassword.sentTitle');
    fireEvent.press(getByText('forgotPassword.back'));

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.auth.login);
  });

  it('vuelve al login desde el link de atrás del formulario', () => {
    const { getAllByA11yHint } = render(<ForgotPasswordScreen />);

    fireEvent.press(getAllByA11yHint('forgotPassword.back')[0]);

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.auth.login);
  });
});
