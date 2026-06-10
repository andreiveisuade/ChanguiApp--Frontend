import { renderHook, act } from '@testing-library/react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useNetworkStatus } from '../useNetworkStatus';

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: { addEventListener: jest.fn() },
}));

const mockedAddEventListener = jest.mocked(NetInfo.addEventListener);

/** Captura el callback que el hook registra en NetInfo para emitir estados a mano. */
const captureListener = () => {
  let listener: (state: NetInfoState) => void = () => {};
  const unsubscribe = jest.fn();
  mockedAddEventListener.mockImplementation((cb) => {
    listener = cb as (state: NetInfoState) => void;
    return unsubscribe;
  });
  return { emit: (state: Partial<NetInfoState>) => listener(state as NetInfoState), unsubscribe };
};

describe('useNetworkStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('arranca asumiendo conexión hasta el primer evento', () => {
    mockedAddEventListener.mockReturnValue(jest.fn());
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toEqual({ isConnected: true, isInternetReachable: null });
  });

  it('refleja el estado emitido por el listener', () => {
    const { emit } = captureListener();
    const { result } = renderHook(() => useNetworkStatus());

    act(() => emit({ isConnected: false, isInternetReachable: false }));

    expect(result.current).toEqual({ isConnected: false, isInternetReachable: false });
  });

  it('mapea isConnected null a false', () => {
    const { emit } = captureListener();
    const { result } = renderHook(() => useNetworkStatus());

    act(() => emit({ isConnected: null, isInternetReachable: null }));

    expect(result.current.isConnected).toBe(false);
  });

  it('se desuscribe al desmontar', () => {
    const { unsubscribe } = captureListener();
    const { unmount } = renderHook(() => useNetworkStatus());

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
