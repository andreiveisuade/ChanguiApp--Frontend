import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AppHeader } from '../AppHeader';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts?.value !== undefined ? `${key} ${opts.value}` : key),
  }),
}));

jest.mock('@/../assets/logos/changuiapp-logo.svg', () => 'ChanguiAppLogo');

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text> };
});

describe('AppHeader Component', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the app name and brand without a back button by default', () => {
    const { getByText, queryByRole } = render(<AppHeader />);

    expect(getByText('app_name')).toBeTruthy();
    expect(queryByRole('button')).toBeNull();
  });

  it('renders a back button when onBack is provided', () => {
    const { getByRole, getByText } = render(<AppHeader onBack={mockOnBack} />);

    expect(getByRole('button')).toBeTruthy();
    expect(getByText('atras')).toBeTruthy();
  });

  it('calls onBack when the back button is pressed', () => {
    const { getByRole } = render(<AppHeader onBack={mockOnBack} />);

    fireEvent.press(getByRole('button'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
