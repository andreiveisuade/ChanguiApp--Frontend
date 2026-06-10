import React from 'react';
import { render } from '@testing-library/react-native';
import { PurchaseItemRow } from '../PurchaseItemRow';
import { PurchaseItem } from '@/types/domain';

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

const makeItem = (overrides: Partial<PurchaseItem> = {}): PurchaseItem => ({
  id: '1',
  purchase_id: 'p1',
  product_name: 'Fideos',
  barcode: '7790000000001',
  quantity: 2,
  unit_price: 800,
  ...overrides,
});

describe('PurchaseItemRow Component', () => {
  it('renders the product name and quantity', () => {
    const { getByText } = render(<PurchaseItemRow item={makeItem()} />);

    expect(getByText('Fideos')).toBeTruthy();
    expect(getByText('×2')).toBeTruthy();
  });

  it('renders the line total formatted as unit_price * quantity', () => {
    const { getByText } = render(
      <PurchaseItemRow item={makeItem({ unit_price: 800, quantity: 2 })} />
    );

    expect(getByText('$1.600')).toBeTruthy();
  });

  it('renders the correct line total for a single unit', () => {
    const { getByText } = render(
      <PurchaseItemRow item={makeItem({ unit_price: 1500, quantity: 1 })} />
    );

    expect(getByText('×1')).toBeTruthy();
    expect(getByText('$1.500')).toBeTruthy();
  });

  it('renders without crashing when isLast is true', () => {
    const { getByText } = render(<PurchaseItemRow item={makeItem()} isLast />);
    expect(getByText('Fideos')).toBeTruthy();
  });
});
