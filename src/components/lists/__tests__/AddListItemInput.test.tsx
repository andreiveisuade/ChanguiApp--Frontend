import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AddListItemInput } from '../AddListItemInput';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o?.value !== undefined ? `${k} ${o.value}` : k),
  }),
}));

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text> };
});

describe('AddListItemInput Component', () => {
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the input and add button', () => {
    const { getByPlaceholderText, getAllByLabelText } = render(
      <AddListItemInput onAdd={mockOnAdd} />
    );

    expect(getByPlaceholderText('lists.addItemPlaceholder')).toBeTruthy();
    expect(getAllByLabelText('lists.addItem').length).toBeGreaterThan(0);
  });

  it('updates the input value when typing', () => {
    const { getByPlaceholderText } = render(<AddListItemInput onAdd={mockOnAdd} />);

    const input = getByPlaceholderText('lists.addItemPlaceholder');
    fireEvent.changeText(input, 'Leche');
    expect(input.props.value).toBe('Leche');
  });

  it('calls onAdd with the trimmed value and clears the input on submit', () => {
    const { getByPlaceholderText } = render(<AddListItemInput onAdd={mockOnAdd} />);

    const input = getByPlaceholderText('lists.addItemPlaceholder');
    fireEvent.changeText(input, '  Pan  ');
    fireEvent(input, 'submitEditing');

    expect(mockOnAdd).toHaveBeenCalledWith('Pan');
    expect(input.props.value).toBe('');
  });

  it('calls onAdd when the button is pressed with a valid value', () => {
    const { getByPlaceholderText, getByRole } = render(
      <AddListItemInput onAdd={mockOnAdd} />
    );

    const input = getByPlaceholderText('lists.addItemPlaceholder');
    fireEvent.changeText(input, 'Yerba');
    fireEvent.press(getByRole('button'));

    expect(mockOnAdd).toHaveBeenCalledWith('Yerba');
  });

  it('does not call onAdd when the value is empty or whitespace', () => {
    const { getByPlaceholderText } = render(<AddListItemInput onAdd={mockOnAdd} />);

    const input = getByPlaceholderText('lists.addItemPlaceholder');
    fireEvent.changeText(input, '   ');
    fireEvent(input, 'submitEditing');

    expect(mockOnAdd).not.toHaveBeenCalled();
  });
});
