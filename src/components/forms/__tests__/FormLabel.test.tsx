import React from 'react';
import { render } from '@testing-library/react-native';
import { FormLabel } from '../FormLabel';

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

describe('FormLabel Component', () => {
  it('debe renderizar el texto de la etiqueta correctamente', () => {
    const { getByText } = render(<FormLabel>Email Address</FormLabel>);
    expect(getByText('Email Address')).toBeTruthy();
  });
});
