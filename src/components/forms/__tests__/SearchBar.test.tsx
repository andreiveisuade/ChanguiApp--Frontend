import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '../SearchBar';

jest.mock('@/components/atoms/AppIcon', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text>,
  };
});

describe('SearchBar Component', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search icon and placeholder', () => {
    const { getByPlaceholderText, getAllByTestId } = render(
      <SearchBar value="" onChangeText={mockOnChangeText} placeholder="Buscar productos" />,
    );

    expect(getByPlaceholderText('Buscar productos')).toBeTruthy();
    expect(getAllByTestId('app-icon')[0].props.children).toBe('buscar');
  });

  it('calls onChangeText when text changes', () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={mockOnChangeText} placeholder="Buscar" />,
    );

    fireEvent.changeText(getByPlaceholderText('Buscar'), 'leche');
    expect(mockOnChangeText).toHaveBeenCalledWith('leche');
  });

  it('does not show the clear button when value is empty', () => {
    const { queryByLabelText } = render(
      <SearchBar value="" onChangeText={mockOnChangeText} placeholder="Buscar" />,
    );

    expect(queryByLabelText('Limpiar búsqueda')).toBeNull();
  });

  it('shows the clear button and clears the value when pressed', () => {
    const { getByLabelText } = render(
      <SearchBar value="leche" onChangeText={mockOnChangeText} placeholder="Buscar" />,
    );

    const clearButton = getByLabelText('Limpiar búsqueda');
    expect(clearButton).toBeTruthy();

    fireEvent.press(clearButton);
    expect(mockOnChangeText).toHaveBeenCalledWith('');
  });

  it('calls onSearchPress on submit editing', () => {
    const mockOnSearchPress = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar
        value="leche"
        onChangeText={mockOnChangeText}
        onSearchPress={mockOnSearchPress}
        placeholder="Buscar"
      />,
    );

    fireEvent(getByPlaceholderText('Buscar'), 'submitEditing');
    expect(mockOnSearchPress).toHaveBeenCalledTimes(1);
  });
});
