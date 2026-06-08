import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useCheckout } from '../useCheckout';
import CheckoutRepository from '@/repositories/CheckoutRepository';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';
import { AuthSessionExpiredError, UserFriendlyError } from '@/types/errors';

jest.mock('expo-web-browser', () => ({ openAuthSessionAsync: jest.fn() }));
jest.mock('expo-auth-session', () => ({ makeRedirectUri: jest.fn() }));

jest.mock('@/repositories/CheckoutRepository', () => ({
  __esModule: true,
  default: { createPreference: jest.fn(), getStatus: jest.fn() },
}));

jest.mock('@/services/ErrorTranslationService', () => ({
  ErrorTranslationService: { translate: jest.fn() },
}));

const mockedCreatePreference = jest.mocked(CheckoutRepository.createPreference);
const mockedOpenAuth = jest.mocked(WebBrowser.openAuthSessionAsync);
const mockedMakeRedirectUri = jest.mocked(AuthSession.makeRedirectUri);
const mockedTranslate = jest.mocked(ErrorTranslationService.translate);

const translated: UserFriendlyError = {
  title: 'Error del servidor',
  message: 'Algo salió mal.',
  code: 'SERVER_ERROR',
};

describe('useCheckout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMakeRedirectUri.mockReturnValue('changuiapp://checkout/return');
    mockedCreatePreference.mockResolvedValue({ preference_id: 'pref-1', init_point: 'https://mp.com/init' });
    mockedOpenAuth.mockResolvedValue({ type: 'dismiss' } as Awaited<ReturnType<typeof WebBrowser.openAuthSessionAsync>>);
    mockedTranslate.mockReturnValue(translated);
  });

  it('startCheckout crea la preferencia, abre el browser y devuelve el preferenceId', async () => {
    const { result } = renderHook(() => useCheckout());

    let resultValue: { preferenceId: string } | null = null;
    await act(async () => {
      resultValue = await result.current.startCheckout();
    });

    expect(mockedCreatePreference).toHaveBeenCalledTimes(1);
    expect(mockedOpenAuth).toHaveBeenCalledWith('https://mp.com/init', 'changuiapp://checkout/return');
    expect(resultValue).toEqual({ preferenceId: 'pref-1' });
    expect(result.current.isStarting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sesión expirada: devuelve null sin exponer error', async () => {
    mockedCreatePreference.mockRejectedValueOnce(new AuthSessionExpiredError());
    const { result } = renderHook(() => useCheckout());

    let resultValue: { preferenceId: string } | null = { preferenceId: 'x' };
    await act(async () => {
      resultValue = await result.current.startCheckout();
    });

    expect(resultValue).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockedTranslate).not.toHaveBeenCalled();
  });

  it('error genérico: traduce, expone el error y devuelve null', async () => {
    mockedCreatePreference.mockRejectedValueOnce(new Error('Request failed with status 500'));
    const { result } = renderHook(() => useCheckout());

    let resultValue: { preferenceId: string } | null = { preferenceId: 'x' };
    await act(async () => {
      resultValue = await result.current.startCheckout();
    });

    expect(resultValue).toBeNull();
    expect(mockedTranslate).toHaveBeenCalled();
    expect(result.current.error).toEqual(translated);
    expect(result.current.isStarting).toBe(false);
  });

  it('clearError limpia el error', async () => {
    mockedCreatePreference.mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useCheckout());
    await act(async () => {
      await result.current.startCheckout();
    });
    await waitFor(() => expect(result.current.error).toEqual(translated));

    act(() => result.current.clearError());

    expect(result.current.error).toBeNull();
  });
});
