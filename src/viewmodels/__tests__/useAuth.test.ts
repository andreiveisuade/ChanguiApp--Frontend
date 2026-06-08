import { renderHook } from '@testing-library/react-native';
import { useAuth } from '../useAuth';
import { useAuthContext, type AuthContextValue } from '@/context/AuthContext';

jest.mock('@/context/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

const mockedUseAuthContext = jest.mocked(useAuthContext);

const buildContextValue = (): AuthContextValue => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  login: jest.fn(),
  register: jest.fn(),
  loginWithGoogle: jest.fn(),
  resetPassword: jest.fn(),
  logout: jest.fn(),
  clearError: jest.fn(),
  updateUser: jest.fn(),
});

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve exactamente el value expuesto por el AuthContext', () => {
    const contextValue = buildContextValue();
    mockedUseAuthContext.mockReturnValue(contextValue);

    const { result } = renderHook(() => useAuth());

    expect(result.current).toBe(contextValue);
    expect(mockedUseAuthContext).toHaveBeenCalledTimes(1);
  });

  it('propaga el error si se consume fuera del AuthProvider', () => {
    mockedUseAuthContext.mockImplementation(() => {
      throw new Error('useAuth must be used within an AuthProvider');
    });

    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
  });
});
