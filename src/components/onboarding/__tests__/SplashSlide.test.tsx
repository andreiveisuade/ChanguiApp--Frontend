import React from 'react';
import { render } from '@testing-library/react-native';
import { SplashSlide } from '../SplashSlide';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o?.value !== undefined ? `${k} ${o.value}` : k),
  }),
}));

jest.mock('@/../assets/logos/changuiapp-logo.svg', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: (props: any) => <View testID="logo" {...props} /> };
});

describe('SplashSlide Component', () => {
  it('renders the app name and tagline', () => {
    const { getByText } = render(<SplashSlide />);

    expect(getByText('app_name')).toBeTruthy();
    expect(getByText('onboarding.splash.tagline')).toBeTruthy();
  });

  it('renders the logo', () => {
    const { getByTestId } = render(<SplashSlide />);
    expect(getByTestId('logo')).toBeTruthy();
  });
});
