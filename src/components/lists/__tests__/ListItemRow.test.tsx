import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ListItemRow } from '../ListItemRow';
import { ShoppingListItem } from '@/types/domain';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o?.value !== undefined ? `${k} ${o.value}` : k),
  }),
}));

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text> };
});

const makeItem = (overrides: Partial<ShoppingListItem> = {}): ShoppingListItem => ({
  id: '1',
  list_id: 'l1',
  barcode: '779',
  name: 'Manzanas',
  brand: null,
  price: 100,
  image_url: null,
  quantity: 1,
  purchased: false,
  ...overrides,
});

describe('ListItemRow Component', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the item name and the unchecked icon when not purchased', () => {
    const { getByText, getByTestId } = render(
      <ListItemRow item={makeItem()} onToggle={mockOnToggle} />,
    );

    expect(getByText('Manzanas')).toBeTruthy();
    expect(getByTestId('app-icon').props.children).toBe('circulo');
  });

  it('renders the checked icon and markUnpurchased label when purchased', () => {
    const { getByTestId, getByLabelText } = render(
      <ListItemRow item={makeItem({ purchased: true })} onToggle={mockOnToggle} />,
    );

    expect(getByTestId('app-icon').props.children).toBe('exito');
    expect(getByLabelText('lists.markUnpurchased')).toBeTruthy();
  });

  it('shows the quantity only when greater than 1', () => {
    const { queryByText, rerender } = render(
      <ListItemRow item={makeItem({ quantity: 1 })} onToggle={mockOnToggle} />,
    );
    expect(queryByText('×1')).toBeNull();

    rerender(<ListItemRow item={makeItem({ quantity: 3 })} onToggle={mockOnToggle} />);
    expect(queryByText('×3')).toBeTruthy();
  });

  it('calls onToggle when the checkbox is pressed', () => {
    const { getByLabelText } = render(<ListItemRow item={makeItem()} onToggle={mockOnToggle} />);

    fireEvent.press(getByLabelText('lists.markPurchased'));
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('renders the delete button only when onDelete is provided', () => {
    const onDelete = jest.fn();
    const { queryByLabelText, rerender } = render(
      <ListItemRow item={makeItem()} onToggle={mockOnToggle} />,
    );
    expect(queryByLabelText('lists.deleteItem')).toBeNull();

    rerender(<ListItemRow item={makeItem()} onToggle={mockOnToggle} onDelete={onDelete} />);
    fireEvent.press(queryByLabelText('lists.deleteItem')!);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
