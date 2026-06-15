import React from 'react';
import { Keyboard } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ProductSearchInput } from '../ProductSearchInput';
import { useProductSearch } from '@/viewmodels/useProductSearch';
import { Product } from '@/types/domain';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

jest.mock('@/viewmodels/useProductSearch', () => ({ useProductSearch: jest.fn() }));

jest.mock('@/components/forms/SearchBar', () => {
  const { TextInput } = require('react-native');
  return {
    SearchBar: ({ value, onChangeText, accessibilityLabel, placeholder }: any) => (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={accessibilityLabel}
        placeholder={placeholder}
      />
    ),
  };
});

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children }: any) => <Text>{children}</Text> };
});

jest.mock('@/utils/currency', () => ({ formatARS: (n: number) => `$${n}` }));

const mockUseProductSearch = useProductSearch as jest.Mock;

const product: Product = {
  id: 'p1',
  name: 'Leche',
  barcode: '779',
  brand: 'La Serenísima',
  image_url: null,
  price: 1500,
};

const setQuery = jest.fn();

const mockSearch = (over: Partial<ReturnType<typeof useProductSearch>> = {}) => {
  mockUseProductSearch.mockReturnValue({
    query: '',
    setQuery,
    results: [],
    isLoading: false,
    ...over,
  });
};

describe('ProductSearchInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearch();
  });

  it('renderiza el buscador con su placeholder', () => {
    const { getByLabelText } = render(<ProductSearchInput onSelect={jest.fn()} />);
    expect(getByLabelText('lists.searchPlaceholder')).toBeTruthy();
  });

  it('muestra los resultados con nombre, marca y precio', () => {
    mockSearch({ query: 'leche', results: [product] });
    const { getByText } = render(<ProductSearchInput onSelect={jest.fn()} />);

    expect(getByText('Leche')).toBeTruthy();
    expect(getByText('La Serenísima')).toBeTruthy();
    expect(getByText('$1500')).toBeTruthy();
  });

  it('al seleccionar un resultado llama onSelect, limpia la query y baja el teclado', () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
    mockSearch({ query: 'leche', results: [product] });
    const onSelect = jest.fn();
    const { getByLabelText } = render(<ProductSearchInput onSelect={onSelect} />);

    fireEvent.press(getByLabelText('Leche'));

    expect(onSelect).toHaveBeenCalledWith(product);
    expect(setQuery).toHaveBeenCalledWith('');
    expect(dismiss).toHaveBeenCalled();
  });

  it('omite la marca cuando el producto no la tiene', () => {
    mockSearch({ query: 'pan', results: [{ ...product, brand: null }] });
    const { getByText, queryByText } = render(<ProductSearchInput onSelect={jest.fn()} />);
    expect(getByText('Leche')).toBeTruthy();
    expect(queryByText('La Serenísima')).toBeNull();
  });

  it('muestra el vacío cuando hay query suficiente y no hay resultados', () => {
    mockSearch({ query: 'xyz', results: [], isLoading: false });
    const { getByText } = render(<ProductSearchInput onSelect={jest.fn()} />);
    expect(getByText('lists.noResults')).toBeTruthy();
  });

  it('no muestra el vacío mientras está cargando ni con query corta', () => {
    mockSearch({ query: 'x', results: [], isLoading: false });
    const { queryByText, rerender } = render(<ProductSearchInput onSelect={jest.fn()} />);
    expect(queryByText('lists.noResults')).toBeNull();

    mockSearch({ query: 'xyz', results: [], isLoading: true });
    rerender(<ProductSearchInput onSelect={jest.fn()} />);
    expect(queryByText('lists.noResults')).toBeNull();
  });
});
