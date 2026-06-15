import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfileButton } from '../ProfileButton';

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text> };
});

describe('ProfileButton Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title', () => {
    const { getByText } = render(<ProfileButton title="Save" onPress={mockOnPress} />);
    expect(getByText('Save')).toBeTruthy();
  });

  it('calls onPress when pressed and enabled', () => {
    const { getByText } = render(<ProfileButton title="Save" onPress={mockOnPress} />);
    fireEvent.press(getByText('Save'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByText } = render(<ProfileButton title="Save" onPress={mockOnPress} disabled />);
    fireEvent.press(getByText('Save'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when variant is disabled', () => {
    const { getByText } = render(
      <ProfileButton title="Save" onPress={mockOnPress} variant="disabled" />,
    );
    fireEvent.press(getByText('Save'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('renders an ActivityIndicator and hides the title when loading', () => {
    const { UNSAFE_getByType, queryByText } = render(
      <ProfileButton title="Save" onPress={mockOnPress} isLoading />,
    );
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(queryByText('Save')).toBeNull();
  });

  it('does not call onPress when loading', () => {
    const { UNSAFE_getByType } = render(
      <ProfileButton title="Save" onPress={mockOnPress} isLoading />,
    );
    fireEvent.press(UNSAFE_getByType(ActivityIndicator));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('renders an icon when iconName is provided', () => {
    const { getByTestId } = render(
      <ProfileButton title="Save" onPress={mockOnPress} iconName="editar" />,
    );
    expect(getByTestId('app-icon').props.children).toBe('editar');
  });

  it('does not render an icon when iconName is omitted', () => {
    const { queryByTestId } = render(<ProfileButton title="Save" onPress={mockOnPress} />);
    expect(queryByTestId('app-icon')).toBeNull();
  });

  it('renders the secondary variant', () => {
    const { getByText } = render(
      <ProfileButton title="Cancel" onPress={mockOnPress} variant="secondary" />,
    );
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('renders the danger variant', () => {
    const { getByText } = render(
      <ProfileButton title="Delete" onPress={mockOnPress} variant="danger" />,
    );
    expect(getByText('Delete')).toBeTruthy();
  });

  it('renders the warning variant', () => {
    const { getByText } = render(
      <ProfileButton title="Logout" onPress={mockOnPress} variant="warning" />,
    );
    expect(getByText('Logout')).toBeTruthy();
  });
});
