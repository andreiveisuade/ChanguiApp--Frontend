import CheckoutRepository from '../CheckoutRepository';
import httpClient from '@/config/clients';

jest.mock('@/config/clients', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedGet = httpClient.get as jest.Mock;
const mockedPost = httpClient.post as jest.Mock;
const axiosResponse = <T>(data: T) => ({ data });

describe('CheckoutRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createPreference hace POST y devuelve init_point + preference_id', async () => {
    mockedPost.mockResolvedValueOnce(
      axiosResponse({ preference_id: 'pref-1', init_point: 'https://mp.com/init' }),
    );

    const result = await CheckoutRepository.createPreference();

    expect(mockedPost).toHaveBeenCalledWith('/api/checkout');
    expect(result).toEqual({ preference_id: 'pref-1', init_point: 'https://mp.com/init' });
  });

  it('getStatus consulta el estado pasando el preference_id como param', async () => {
    mockedGet.mockResolvedValueOnce(axiosResponse({ status: 'completed' }));

    const result = await CheckoutRepository.getStatus('pref/1 2');

    expect(mockedGet).toHaveBeenCalledWith('/api/checkout/status', {
      params: { preference_id: 'pref/1 2' },
    });
    expect(result).toEqual({ status: 'completed' });
  });
});
