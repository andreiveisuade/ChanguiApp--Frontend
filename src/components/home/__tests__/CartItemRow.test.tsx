import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CartItemRow } from '../CartItemRow';
import { CartItemWithProduct, Product } from '@/types/domain';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text> };
});

describe('CartItemRow Component', () => {
  const mockProduct: Product = {
    id: 'prod-1',
    name: 'Yerba Mate',
    barcode: '12345678',
    brand: 'Taragui',
    image_url: 'https://example.com/yerba.jpg',
    price: 150.5,
  };

  const mockItem: CartItemWithProduct = {
    id: 'item-1',
    cart_id: 'cart-1',
    product_id: 'prod-1',
    quantity: 3,
    unit_price: 150.5,
    created_at: '',
    updated_at: '',
    product: mockProduct,
  };

  it('renders correctly with product name and calculated total price', () => {
    const { getByText } = render(<CartItemRow item={mockItem} isLast={false} />);

    expect(getByText('Yerba Mate')).toBeTruthy();
    expect(getByText('$452')).toBeTruthy();
  });

  it('renders Image when image_url is provided and loading does not fail', () => {
    const { UNSAFE_getByType, queryByTestId } = render(
      <CartItemRow item={mockItem} isLast={false} />,
    );

    const { Image } = require('react-native');
    expect(UNSAFE_getByType(Image)).toBeTruthy();
    expect(queryByTestId('app-icon')).toBeNull();
  });

  it('renders fallback AppIcon when image_url is empty', () => {
    const itemWithoutImage: CartItemWithProduct = {
      ...mockItem,
      product: mockItem.product ? { ...mockItem.product, image_url: '' } : null,
    };
    const { queryByRole, getByTestId } = render(
      <CartItemRow item={itemWithoutImage} isLast={false} />,
    );

    expect(getByTestId('app-icon').props.children).toBe('package');
  });

  it('switches to fallback AppIcon when Image triggers onError', () => {
    const { UNSAFE_getByType, getByTestId } = render(
      <CartItemRow item={mockItem} isLast={false} />,
    );

    const { Image } = require('react-native');
    const imageElement = UNSAFE_getByType(Image);

    fireEvent(imageElement, 'error');

    expect(getByTestId('app-icon').props.children).toBe('package');
  });

  it('applies styles based on isLast prop', () => {
    const { UNSAFE_root, rerender } = render(<CartItemRow item={mockItem} isLast={false} />);

    const rootElement = UNSAFE_root.children[0];
    if (typeof rootElement !== 'string') {
      expect(rootElement.props.style).not.toContainEqual(
        expect.objectContaining({ borderBottomWidth: 0 }),
      );
    }

    rerender(<CartItemRow item={mockItem} isLast={true} />);
    const rootElementUpdated = UNSAFE_root.children[0];
    if (typeof rootElementUpdated !== 'string') {
      expect(rootElementUpdated.props.style).toContainEqual(
        expect.objectContaining({ borderBottomWidth: 0 }),
      );
    }
  });
});
