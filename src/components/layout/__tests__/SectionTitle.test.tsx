import React from 'react';
import { render } from '@testing-library/react-native';
import { SectionTitle } from '../SectionTitle';

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

describe('SectionTitle Component', () => {
  it('renders the provided title', () => {
    const { getByText } = render(<SectionTitle title="Mi carrito" />);

    expect(getByText('Mi carrito')).toBeTruthy();
  });

  it('applies a custom style when provided', () => {
    const customStyle = { color: 'red' };
    const { getByText } = render(<SectionTitle title="Historial" style={customStyle} />);

    const node = getByText('Historial');
    const style = node.props.style;
    const flat = Array.isArray(style) ? style.flat(Infinity) : [style];
    expect(flat).toContainEqual(customStyle);
  });
});
