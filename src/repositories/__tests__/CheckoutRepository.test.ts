import CheckoutRepository from '../CheckoutRepository';
import { apiFetch } from '@/utils/apiFetch';

jest.mock('@/utils/apiFetch', () => ({ apiFetch: jest.fn() }));

const mockedFetch = jest.mocked(apiFetch);
const jsonResponse = (data: unknown) => ({ json: async () => data }) as Response;

describe('CheckoutRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createPreference hace POST y devuelve init_point + preference_id', async () => {
    mockedFetch.mockResolvedValueOnce(jsonResponse({ preference_id: 'pref-1', init_point: 'https://mp.com/init' }));

    const result = await CheckoutRepository.createPreference();

    expect(mockedFetch).toHaveBeenCalledWith('/api/checkout', { method: 'POST' });
    expect(result).toEqual({ preference_id: 'pref-1', init_point: 'https://mp.com/init' });
  });

  it('getStatus consulta el estado con el preference_id encodeado', async () => {
    mockedFetch.mockResolvedValueOnce(jsonResponse({ status: 'completed' }));

    const result = await CheckoutRepository.getStatus('pref/1 2');

    expect(mockedFetch).toHaveBeenCalledWith('/api/checkout/status?preference_id=pref%2F1%202');
    expect(result).toEqual({ status: 'completed' });
  });
});
