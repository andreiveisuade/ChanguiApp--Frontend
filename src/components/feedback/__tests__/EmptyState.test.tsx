import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o?.value !== undefined ? `${k} ${o.value}` : k),
  }),
}));

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text: RNText } = require('react-native');
  return {
    AppIcon: ({ name }: { name: string }) => <RNText>{`icon-${name}`}</RNText>,
  };
});

jest.mock('@/components/atoms/AppText', () => {
  const { Text: RNText } = require('react-native');
  return {
    AppText: ({ children }: { children: React.ReactNode }) => <RNText>{children}</RNText>,
  };
});

describe('EmptyState Component', () => {
  it('renderiza el título por defecto traducido cuando no se pasa title', () => {
    const { getByText } = render(<EmptyState />);
    expect(getByText('common.emptyTitle')).toBeTruthy();
  });

  it('renderiza el título custom cuando se provee', () => {
    const { getByText } = render(<EmptyState title="No hay productos" />);
    expect(getByText('No hay productos')).toBeTruthy();
  });

  it('renderiza el subtítulo cuando se provee', () => {
    const { getByText } = render(<EmptyState subtitle="Escaneá tu primer producto" />);
    expect(getByText('Escaneá tu primer producto')).toBeTruthy();
  });

  it('no renderiza subtítulo cuando no se provee', () => {
    const { queryByText } = render(<EmptyState subtitle="solo-cuando-existe" />);
    expect(queryByText('solo-cuando-existe')).toBeTruthy();
    const { queryByText: queryByText2 } = render(<EmptyState />);
    expect(queryByText2('solo-cuando-existe')).toBeNull();
  });

  it('renderiza el ícono cuando se provee', () => {
    const { getByText } = render(<EmptyState icon="carrito" />);
    expect(getByText('icon-carrito')).toBeTruthy();
  });

  it('no renderiza ícono cuando no se provee', () => {
    const { queryByText } = render(<EmptyState />);
    expect(queryByText('icon-carrito')).toBeNull();
  });

  it('renderiza el action cuando se provee', () => {
    const { getByText } = render(<EmptyState action={<Text>Acción</Text>} />);
    expect(getByText('Acción')).toBeTruthy();
  });
});
