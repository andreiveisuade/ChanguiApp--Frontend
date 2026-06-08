import { renderHook, act } from '@testing-library/react-native';
import { AppState, AppStateStatus } from 'react-native';
import { useCheckoutStatus } from '../useCheckoutStatus';
import CheckoutRepository from '@/repositories/CheckoutRepository';
import { AuthSessionExpiredError } from '@/types/errors';

jest.mock('@/repositories/CheckoutRepository', () => ({
  __esModule: true,
  default: { createPreference: jest.fn(), getStatus: jest.fn() },
}));

const mockedGetStatus = jest.mocked(CheckoutRepository.getStatus);

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 24;

/** Vacía la cola de microtasks (promesas) que quedan pendientes entre timers. */
const flushMicrotasks = async () => {
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
  }
};

let appStateListener: (state: AppStateStatus) => void = () => {};

describe('useCheckoutStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    appStateListener = () => {};
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, cb) => {
      appStateListener = cb as (state: AppStateStatus) => void;
      return { remove: jest.fn() } as ReturnType<typeof AppState.addEventListener>;
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('pasa a success cuando el backend devuelve completed', async () => {
    mockedGetStatus.mockResolvedValue({ status: 'completed' });
    const { result } = renderHook(() => useCheckoutStatus('pref-1'));

    await act(async () => {
      await flushMicrotasks();
    });

    expect(result.current.status).toBe('success');
    expect(mockedGetStatus).toHaveBeenCalledWith('pref-1');
  });

  it('agota los intentos en pending y termina en pending', async () => {
    mockedGetStatus.mockResolvedValue({ status: 'pending' });
    const { result } = renderHook(() => useCheckoutStatus('pref-1'));

    await act(async () => {
      await flushMicrotasks();
    });
    for (let i = 0; i < MAX_ATTEMPTS + 1; i++) {
      await act(async () => {
        jest.advanceTimersByTime(POLL_INTERVAL_MS);
        await flushMicrotasks();
      });
    }

    expect(result.current.status).toBe('pending');
  });

  it('si nunca aparece la compra (not_found) termina en timeout', async () => {
    mockedGetStatus.mockResolvedValue({ status: 'not_found' });
    const { result } = renderHook(() => useCheckoutStatus('pref-1'));

    await act(async () => {
      await flushMicrotasks();
    });
    for (let i = 0; i < MAX_ATTEMPTS + 1; i++) {
      await act(async () => {
        jest.advanceTimersByTime(POLL_INTERVAL_MS);
        await flushMicrotasks();
      });
    }

    expect(result.current.status).toBe('timeout');
  });

  it('con preferenceId vacío no consulta el estado', async () => {
    const { result } = renderHook(() => useCheckoutStatus(''));

    await act(async () => {
      await flushMicrotasks();
    });

    expect(mockedGetStatus).not.toHaveBeenCalled();
    expect(result.current.status).toBe('checking');
  });

  it('sesión expirada: corta el polling (no reintenta)', async () => {
    mockedGetStatus.mockRejectedValue(new AuthSessionExpiredError());
    const { result } = renderHook(() => useCheckoutStatus('pref-1'));

    await act(async () => {
      await flushMicrotasks();
    });
    expect(result.current.status).toBe('checking');

    await act(async () => {
      jest.advanceTimersByTime(POLL_INTERVAL_MS * 5);
      await flushMicrotasks();
    });

    expect(mockedGetStatus).toHaveBeenCalledTimes(1);
  });

  it('retry reinicia el chequeo desde checking', async () => {
    mockedGetStatus.mockResolvedValue({ status: 'pending' });
    const { result } = renderHook(() => useCheckoutStatus('pref-1'));

    await act(async () => {
      await flushMicrotasks();
    });
    const before = mockedGetStatus.mock.calls.length;

    await act(async () => {
      result.current.retry();
      await flushMicrotasks();
    });

    expect(result.current.status).toBe('checking');
    expect(mockedGetStatus.mock.calls.length).toBeGreaterThan(before);
  });

  it('al volver la app a foreground re-chequea el estado', async () => {
    mockedGetStatus.mockResolvedValue({ status: 'pending' });
    renderHook(() => useCheckoutStatus('pref-1'));

    await act(async () => {
      await flushMicrotasks();
    });
    const before = mockedGetStatus.mock.calls.length;

    await act(async () => {
      appStateListener('active');
      await flushMicrotasks();
    });

    expect(mockedGetStatus.mock.calls.length).toBeGreaterThan(before);
  });

  it('no re-chequea al volver a foreground si ya fue success', async () => {
    mockedGetStatus.mockResolvedValue({ status: 'completed' });
    const { result } = renderHook(() => useCheckoutStatus('pref-1'));

    await act(async () => {
      await flushMicrotasks();
    });
    expect(result.current.status).toBe('success');
    const before = mockedGetStatus.mock.calls.length;

    await act(async () => {
      appStateListener('active');
      await flushMicrotasks();
    });

    expect(mockedGetStatus.mock.calls.length).toBe(before);
  });
});
