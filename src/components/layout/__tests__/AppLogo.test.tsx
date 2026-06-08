import React from 'react';
import { render } from '@testing-library/react-native';
import { AppLogo } from '../AppLogo';

describe('AppLogo Component', () => {
  it('renders the provided title', () => {
    const { getByText } = render(<AppLogo title="ChanguiApp" />);

    expect(getByText('ChanguiApp')).toBeTruthy();
  });

  it('renders the static "C" mark', () => {
    const { getByText } = render(<AppLogo title="ChanguiApp" />);

    expect(getByText('C')).toBeTruthy();
  });

  it('renders a different title when prop changes', () => {
    const { getByText } = render(<AppLogo title="Otro" />);

    expect(getByText('Otro')).toBeTruthy();
  });
});
