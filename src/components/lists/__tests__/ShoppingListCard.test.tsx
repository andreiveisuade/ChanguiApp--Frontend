import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ShoppingListCard } from '../ShoppingListCard';
import { ShoppingList } from '@/types/domain';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) =>
      o?.done !== undefined ? `${k} ${o.done}/${o.total}` : k,
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

const makeList = (overrides: Partial<ShoppingList> = {}): ShoppingList => ({
  id: '1',
  name: 'Compra semanal',
  total_items: 4,
  done_items: 2,
  ...overrides,
});

describe('ShoppingListCard Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the list name and progress text', () => {
    const { getByText } = render(
      <ShoppingListCard list={makeList()} onPress={mockOnPress} />
    );

    expect(getByText('Compra semanal')).toBeTruthy();
    expect(getByText('lists.progress 2/4')).toBeTruthy();
  });

  it('computes the progress fill width based on done/total items', () => {
    const { UNSAFE_getAllByType } = render(
      <ShoppingListCard list={makeList({ done_items: 1, total_items: 4 })} onPress={mockOnPress} />
    );

    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    const fill = views.find((v: any) => {
      const style = Array.isArray(v.props.style) ? v.props.style : [v.props.style];
      return style.some((s: any) => s && s.width === '25%');
    });
    expect(fill).toBeTruthy();
  });

  it('renders 0% width when there are no items (no division by zero)', () => {
    const { UNSAFE_getAllByType } = render(
      <ShoppingListCard list={makeList({ done_items: 0, total_items: 0 })} onPress={mockOnPress} />
    );

    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    const fill = views.find((v: any) => {
      const style = Array.isArray(v.props.style) ? v.props.style : [v.props.style];
      return style.some((s: any) => s && s.width === '0%');
    });
    expect(fill).toBeTruthy();
  });

  it('calls onPress when the card is pressed', () => {
    const { getByLabelText } = render(
      <ShoppingListCard list={makeList()} onPress={mockOnPress} />
    );

    fireEvent.press(getByLabelText('Compra semanal'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
