import { renderHook, act } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => {
  let listeners: ((state: any) => void)[] = [];
  return {
    addEventListener: jest.fn((callback) => {
      listeners.push(callback);
      return () => {
        listeners = listeners.filter((l) => l !== callback);
      };
    }),
    // Helper for tests to trigger network state updates
    __triggerChange: (state: any) => {
      listeners.forEach((listener) => listener(state));
    },
    __clearListeners: () => {
      listeners = [];
    },
  };
});

describe('useNetworkStatus', () => {
  beforeEach(() => {
    (NetInfo.addEventListener as jest.Mock).mockClear();
    // @ts-ignore
    NetInfo.__clearListeners();
  });

  it('starts with isConnected: true and isInternetReachable: null', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current).toEqual({
      isConnected: true,
      isInternetReachable: null,
    });
    expect(NetInfo.addEventListener).toHaveBeenCalledTimes(1);
  });

  it('updates state when network status changes', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      // @ts-ignore
      NetInfo.__triggerChange({
        isConnected: false,
        isInternetReachable: false,
      });
    });

    expect(result.current).toEqual({
      isConnected: false,
      isInternetReachable: false,
    });
  });

  it('handles null/undefined values in status change', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      // @ts-ignore
      NetInfo.__triggerChange({
        isConnected: null,
        isInternetReachable: null,
      });
    });

    expect(result.current).toEqual({
      isConnected: false,
      isInternetReachable: null,
    });
  });

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useNetworkStatus());
    const unsubscribeMock = (NetInfo.addEventListener as jest.Mock).mock.results[0].value;
    const unsubscribeSpy = jest.fn(unsubscribeMock);

    (NetInfo.addEventListener as jest.Mock).mockReturnValueOnce(unsubscribeSpy);

    const { unmount: unmount2 } = renderHook(() => useNetworkStatus());
    unmount2();

    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });
});
