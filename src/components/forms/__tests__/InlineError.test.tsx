import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { InlineError } from '../InlineError';

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

describe('InlineError Component', () => {
  it('no debe renderizar nada si el mensaje es null o undefined', () => {
    const { toJSON } = render(<InlineError message={null} />);
    expect(toJSON()).toBeNull();

    const { toJSON: toJSONUndefined } = render(<InlineError message={undefined} />);
    expect(toJSONUndefined()).toBeNull();
  });

  it('debe renderizar el mensaje y el indicador de error si se proporciona un mensaje', () => {
    const { getByText, UNSAFE_getByType } = render(<InlineError message="Formato de email inválido" />);
    
    const view = UNSAFE_getByType(View);
    expect(view.props.accessibilityRole).toBe('alert');
    expect(getByText('!')).toBeTruthy();
    expect(getByText('Formato de email inválido')).toBeTruthy();
  });
});
