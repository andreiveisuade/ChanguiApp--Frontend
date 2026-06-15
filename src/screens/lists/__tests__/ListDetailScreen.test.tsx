import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ListDetailScreen } from '../ListDetailScreen';
import { useListDetail } from '@/viewmodels/useListDetail';
import { useLocalSearchParams } from 'expo-router';
import { ShoppingListItem } from '@/types/domain';

const mockBack = jest.fn();
const addProduct = jest.fn();
const toggleItem = jest.fn();
const removeItem = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: () => ({ back: mockBack }),
}));
jest.mock('@/viewmodels/useListDetail', () => ({ useListDetail: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: ({ children, style }: any) => <View style={style}>{children}</View> };
});
jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children }: any) => <Text>{children}</Text> };
});
jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text>{name}</Text> };
});
jest.mock('@/components/lists/ProductSearchInput', () => {
  const { Text, Pressable } = require('react-native');
  const product = {
    id: 'p1',
    name: 'Leche',
    barcode: '779',
    brand: null,
    image_url: null,
    price: 1500,
  };
  return {
    ProductSearchInput: ({ onSelect }: any) => (
      <Pressable accessibilityLabel="add-product" onPress={() => onSelect(product)}>
        <Text>search</Text>
      </Pressable>
    ),
  };
});
jest.mock('@/components/lists/ListItemRow', () => {
  const { Text, Pressable } = require('react-native');
  return {
    ListItemRow: ({ item, onToggle, onDelete }: any) => (
      <Pressable accessibilityLabel={`item-${item.id}`} onPress={onToggle} onLongPress={onDelete}>
        <Text>{item.name}</Text>
      </Pressable>
    ),
  };
});

const mockUseListDetail = useListDetail as jest.Mock;
const mockParams = useLocalSearchParams as unknown as jest.Mock;

const makeItem = (over: Partial<ShoppingListItem> = {}): ShoppingListItem => ({
  id: 'i1',
  list_id: 'l1',
  barcode: '779',
  name: 'Leche',
  brand: null,
  price: 1500,
  image_url: null,
  quantity: 1,
  purchased: false,
  created_at: '2026-06-10T00:00:00.000Z',
  ...over,
});

const setup = (over: Partial<ReturnType<typeof useListDetail>> = {}) => {
  mockUseListDetail.mockReturnValue({
    items: [],
    isLoading: false,
    error: null,
    refresh: jest.fn(),
    addProduct,
    toggleItem,
    setQuantity: jest.fn(),
    removeItem,
    ...over,
  });
};

describe('ListDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams.mockReturnValue({ listId: 'l1', name: 'Súper' });
    setup();
  });

  it('muestra el spinner mientras carga', () => {
    setup({ isLoading: true });
    const { UNSAFE_getByType, getByText } = render(<ListDetailScreen />);
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(getByText('Súper')).toBeTruthy();
  });

  it('muestra el estado vacío cuando no hay ítems', () => {
    setup({ items: [], isLoading: false });
    const { getByText } = render(<ListDetailScreen />);
    expect(getByText('lists.emptyListTitle')).toBeTruthy();
  });

  it('renderiza los ítems de la lista', () => {
    setup({ items: [makeItem(), makeItem({ id: 'i2', name: 'Pan' })] });
    const { getByText } = render(<ListDetailScreen />);
    expect(getByText('Leche')).toBeTruthy();
    expect(getByText('Pan')).toBeTruthy();
  });

  it('alterna y elimina un ítem desde la fila', () => {
    setup({ items: [makeItem()] });
    const { getByLabelText } = render(<ListDetailScreen />);

    fireEvent.press(getByLabelText('item-i1'));
    expect(toggleItem).toHaveBeenCalledWith('i1');

    fireEvent(getByLabelText('item-i1'), 'longPress');
    expect(removeItem).toHaveBeenCalledWith('i1');
  });

  it('agrega un producto desde el buscador', () => {
    const { getByLabelText } = render(<ListDetailScreen />);
    fireEvent.press(getByLabelText('add-product'));
    expect(addProduct).toHaveBeenCalledWith(
      expect.objectContaining({ barcode: '779', name: 'Leche' }),
    );
  });

  it('vuelve atrás al tocar el botón de back', () => {
    const { getByLabelText } = render(<ListDetailScreen />);
    fireEvent.press(getByLabelText('lists.back'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('usa el título genérico cuando no viene el nombre en los params', () => {
    mockParams.mockReturnValue({ listId: 'l1' });
    const { getByText } = render(<ListDetailScreen />);
    expect(getByText('lists.title')).toBeTruthy();
  });
});
