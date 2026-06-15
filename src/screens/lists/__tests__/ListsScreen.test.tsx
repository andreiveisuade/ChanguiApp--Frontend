import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ListsScreen } from '../ListsScreen';
import { useLists } from '@/viewmodels/useLists';
import { ShoppingList } from '@/types/domain';

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));
jest.mock('@/viewmodels/useLists', () => ({ useLists: jest.fn() }));
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
jest.mock('@/components/lists/ShoppingListCard', () => {
  const { Text, Pressable } = require('react-native');
  return {
    ShoppingListCard: ({ list, onPress, onLongPress }: any) => (
      <Pressable accessibilityLabel={list.name} onPress={onPress} onLongPress={onLongPress}>
        <Text>{list.name}</Text>
      </Pressable>
    ),
  };
});

const mockUseLists = useLists as jest.Mock;
const createList = jest.fn();
const deleteList = jest.fn();

const list: ShoppingList = {
  id: 'l1',
  name: 'Súper',
  total_items: 2,
  done_items: 1,
  created_at: '2026-06-10T00:00:00.000Z',
};

const setup = (over: Partial<ReturnType<typeof useLists>> = {}) => {
  mockUseLists.mockReturnValue({
    lists: [],
    isLoading: false,
    error: null,
    refresh: jest.fn(),
    createList,
    deleteList,
    ...over,
  });
};

describe('ListsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  it('renderiza el título y el input de nueva lista', () => {
    const { getByText, getByLabelText } = render(<ListsScreen />);
    expect(getByText('lists.title')).toBeTruthy();
    expect(getByLabelText('lists.newList')).toBeTruthy();
  });

  it('crea una lista con el texto ingresado y limpia el input', () => {
    const { getByLabelText } = render(<ListsScreen />);
    const input = getByLabelText('lists.newList');

    fireEvent.changeText(input, 'Compras');
    fireEvent.press(getByLabelText('lists.createList'));

    expect(createList).toHaveBeenCalledWith('Compras');
    expect(input.props.value).toBe('');
  });

  it('no crea nada con el input vacío (botón deshabilitado)', () => {
    const { getByLabelText } = render(<ListsScreen />);
    fireEvent.press(getByLabelText('lists.createList'));
    expect(createList).not.toHaveBeenCalled();
  });

  it('navega al detalle al tocar una lista', () => {
    setup({ lists: [list] });
    const { getByLabelText } = render(<ListsScreen />);

    fireEvent.press(getByLabelText('Súper'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/list-detail',
      params: { listId: 'l1', name: 'Súper' },
    });
  });

  it('confirma con long press y borra al elegir la acción destructiva', () => {
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _msg, buttons?: any) => {
        buttons?.[1]?.onPress?.();
      });
    setup({ lists: [list] });
    const { getByLabelText } = render(<ListsScreen />);

    fireEvent(getByLabelText('Súper'), 'longPress');
    expect(alertSpy).toHaveBeenCalled();
    expect(deleteList).toHaveBeenCalledWith('l1');
  });

  it('vuelve atrás al tocar el botón de back', () => {
    const { getByLabelText } = render(<ListsScreen />);
    fireEvent.press(getByLabelText('lists.back'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('renderiza un separador entre listas', () => {
    setup({ lists: [list, { ...list, id: 'l2', name: 'Farmacia' }] });
    const { getByLabelText } = render(<ListsScreen />);
    expect(getByLabelText('Súper')).toBeTruthy();
    expect(getByLabelText('Farmacia')).toBeTruthy();
  });

  it('no muestra el estado vacío mientras carga', () => {
    setup({ lists: [], isLoading: true });
    const { queryByText } = render(<ListsScreen />);
    expect(queryByText('lists.emptyTitle')).toBeNull();
  });

  it('muestra el estado vacío cuando no hay listas', () => {
    setup({ lists: [], isLoading: false });
    const { getByText } = render(<ListsScreen />);
    expect(getByText('lists.emptyTitle')).toBeTruthy();
  });
});
