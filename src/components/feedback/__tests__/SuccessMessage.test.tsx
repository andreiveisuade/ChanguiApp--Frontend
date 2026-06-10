import React from 'react';
import { render } from '@testing-library/react-native';
import { SuccessMessage } from '../SuccessMessage';

describe('SuccessMessage Component', () => {
  it('no renderiza nada si message es null', () => {
    const { toJSON } = render(<SuccessMessage message={null} />);
    expect(toJSON()).toBeNull();
  });

  it('no renderiza nada si message es undefined', () => {
    const { toJSON } = render(<SuccessMessage />);
    expect(toJSON()).toBeNull();
  });

  it('no renderiza nada si message es string vacío', () => {
    const { toJSON } = render(<SuccessMessage message="" />);
    expect(toJSON()).toBeNull();
  });

  it('renderiza el mensaje cuando se provee', () => {
    const { getByText } = render(<SuccessMessage message="Operación exitosa" />);
    expect(getByText('Operación exitosa')).toBeTruthy();
  });
});
