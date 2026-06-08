import React from 'react';
import { render } from '@testing-library/react-native';
import { Divider } from '../Divider';

describe('Divider Component', () => {
  it('renders the provided label', () => {
    const { getByText } = render(<Divider label="o" />);

    expect(getByText('o')).toBeTruthy();
  });

  it('renders a different label when prop changes', () => {
    const { getByText } = render(<Divider label="continuar con" />);

    expect(getByText('continuar con')).toBeTruthy();
  });
});
