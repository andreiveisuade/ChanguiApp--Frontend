import React from 'react';
import { render } from '@testing-library/react-native';
import { CartSummaryCard } from '../CartSummaryCard';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (opts && opts.count !== undefined) {
        return `${key} (${opts.count})`;
      }
      return key;
    },
  }),
}));

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children }: any) => <Text>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text>{name}</Text> };
});

describe('CartSummaryCard Component', () => {
  it('muestra indicadores de carga (ActivityIndicator) cuando isLoading es true', () => {
    const { UNSAFE_queryAllByType } = render(
      <CartSummaryCard itemCount={5} total={1500} isLoading={true} />,
    );

    const { ActivityIndicator } = require('react-native');
    const spinners = UNSAFE_queryAllByType(ActivityIndicator);
    expect(spinners.length).toBe(2); // one for itemCount, one for total
  });

  it('muestra mensaje de carrito vacío cuando itemCount es 0', () => {
    const { getByText } = render(<CartSummaryCard itemCount={0} total={0} isLoading={false} />);

    expect(getByText('home.emptyCart')).toBeTruthy();
    expect(getByText('$0')).toBeTruthy();
  });

  it('muestra texto singular de productos cuando itemCount es 1', () => {
    const { getByText } = render(<CartSummaryCard itemCount={1} total={250} isLoading={false} />);

    expect(getByText('home.products_one (1)')).toBeTruthy();
    expect(getByText('$250')).toBeTruthy();
  });

  it('muestra texto plural de productos cuando itemCount es mayor a 1', () => {
    const { getByText } = render(<CartSummaryCard itemCount={3} total={750} isLoading={false} />);

    expect(getByText('home.products_other (3)')).toBeTruthy();
    expect(getByText('$750')).toBeTruthy();
  });
});
