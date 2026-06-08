import React from 'react';
import { render } from '@testing-library/react-native';
import { BarcodeFrame } from '../BarcodeFrame';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o?.value !== undefined ? `${k} ${o.value}` : k),
  }),
}));

describe('BarcodeFrame Component', () => {
  it('renders the scan hint text', () => {
    const { getByText } = render(<BarcodeFrame />);
    expect(getByText('scanner.scanHint')).toBeTruthy();
  });

  it('renders the four frame corners', () => {
    const { UNSAFE_getAllByType } = render(<BarcodeFrame />);

    const { View } = require('react-native');
    // overlay + frame + 4 corners
    expect(UNSAFE_getAllByType(View).length).toBe(6);
  });
});
