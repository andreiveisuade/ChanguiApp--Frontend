import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { AppIcon } from '../AppIcon';

// Mock MaterialCommunityIcons from @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    MaterialCommunityIcons: (props: any) => (
      <Text testID="mock-icon" {...props}>
        {props.name}
      </Text>
    ),
  };
});

describe('AppIcon Component', () => {
  const originalWarn = console.warn;

  beforeEach(() => {
    jest.clearAllMocks();
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.warn = originalWarn;
  });

  it('renders correctly with a valid icon name mapped to MaterialCommunityIcons', () => {
    const { getByTestId, getByText } = render(
      <AppIcon name="inicio" size={30} color="red" />
    );
    const iconElement = getByTestId('mock-icon');

    expect(iconElement).toBeTruthy();
    expect(getByText('home-outline')).toBeTruthy();
    expect(iconElement.props.size).toBe(30);
    expect(iconElement.props.color).toBe('red');
  });

  it('renders with default size and color when not provided', () => {
    const { getByTestId } = render(<AppIcon name="carrito" />);
    const iconElement = getByTestId('mock-icon');

    expect(iconElement.props.size).toBe(24);
    expect(iconElement.props.color).toBeDefined(); // uses theme colors.primary
  });

  it('applies custom style wrapper', () => {
    const customStyle = { margin: 10 };
    const { UNSAFE_getByType } = render(
      <AppIcon name="configuracion" style={customStyle} />
    );
    const viewElement = UNSAFE_getByType(View);
    expect(viewElement.props.style).toEqual(customStyle);
  });

  it('returns null and warns in development when an invalid icon name is provided', () => {
    const { queryByTestId } = render(<AppIcon name="invalid-icon-name" />);
    expect(queryByTestId('mock-icon')).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });
});
