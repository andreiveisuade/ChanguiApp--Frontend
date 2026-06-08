import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsCard } from '../SettingsCard';

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children }: any) => <Text>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text>{name}</Text> };
});

describe('SettingsCard Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    title: 'Editar datos',
    description: 'Nombre, email, telefono',
    iconName: 'editar',
    iconColor: '#4F46E5',
    iconBgColor: '#EFF2FE',
    onPress: mockOnPress,
  };

  it('renders title, description and icon', () => {
    const { getByText } = render(<SettingsCard {...defaultProps} />);

    expect(getByText('Editar datos')).toBeTruthy();
    expect(getByText('Nombre, email, telefono')).toBeTruthy();
    expect(getByText('editar')).toBeTruthy();
  });

  it('exposes accessibility label combining title and description', () => {
    const { getByLabelText } = render(<SettingsCard {...defaultProps} />);

    expect(getByLabelText('Editar datos, Nombre, email, telefono')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByRole } = render(<SettingsCard {...defaultProps} />);

    fireEvent.press(getByRole('button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
